// Estado de la app: plan base (data/plan.json), migraciones, guardado local y borrador persistente.
let PLAN = null;
let state = null;

async function loadPlan(){
  const res = await fetch(`data/plan.json?v=${APP_VERSION}`);
  if(!res.ok) throw new Error(`No pude cargar data/plan.json (${res.status})`);
  PLAN = await res.json();
  buildAliasIndex();
}

function seedState(){
  return {
    settings: clone(PLAN.settings),
    selectedWeek: PLAN.defaultWeek,
    selectedDay: PLAN.defaultDay,
    weeks: clone(PLAN.weeks),
    days: clone(PLAN.days),
    routine: {},
    sessions: [],
    weeklyTargets: {},
    cardio: clone(PLAN.cardio),
    weightLog: clone(PLAN.weightLog),
    ui: { sidebarCompact: false },
    blockStatus: clone(PLAN.blockStatus),
    prs: clone(PLAN.prs),
    autoPRs: {},
    meta: {}
  };
}

// Rutina base de versiones anteriores a V7.3 (se usa para detectar rutinas no editadas).
function baseExercises(day, week){
  const variant = String(week).includes("2.5") ? "pivot" : "normal";
  return clone(PLAN.legacyRoutine[variant][day] || []);
}

function loadState(){
  const direct = storageGet("localStorage", STORAGE_KEY);
  if(direct){
    try { return normalizeState(JSON.parse(direct)); } catch(e){}
  }
  for(const key of LEGACY_KEYS){
    const raw = storageGet("localStorage", key);
    if(raw){
      try {
        const migrated = normalizeState(JSON.parse(raw));
        storageSet("localStorage", STORAGE_KEY, JSON.stringify(migrated));
        return migrated;
      } catch(e){}
    }
  }
  return normalizeState(seedState());
}

function isLegacyDefaultRoutine(weekRoutine, week, days){
  if(!weekRoutine || !Object.keys(weekRoutine).length) return true;
  return days.every(day => {
    const current = weekRoutine[day];
    if(!Array.isArray(current) || !current.length) return true;
    const legacy = baseExercises(day, week).map(e => e.name).join("|");
    return current.map(e => e.name).join("|") === legacy;
  });
}

// Corrige músculos mal clasificados en datos V7.3 ya guardados (solo si siguen con el valor erróneo).
function applyMuscleFixes(data){
  if(data.muscleFixVersion === 1) return;
  const pivot = data.routine["Semana 2.5 Pivot"] || {};
  Object.values(pivot).forEach(list => (list || []).forEach(e => {
    if(e.name === "Gemelos" && normalizeMuscle(e.muscle) === "cuádriceps") e.muscle = "gemelos";
    if(e.name === "Circuito escapular" && normalizeMuscle(e.muscle) === "deltoide lateral") e.muscle = "escápula/manguito";
  }));
  data.sessions.forEach(s => {
    if(s.id !== 250001) return;
    (s.exercises || []).forEach(e => {
      if(e.name === "Sóleo sentado + gemelos de pie" && normalizeMuscle(e.muscle) === "cuádriceps") e.muscle = "gemelos";
    });
  });
  data.muscleFixVersion = 1;
}

// Agrega las sesiones Full Body A/B sin tocar las sesiones ni ejercicios existentes.
// V8.1 las llamaba "Complemento - Full Body A/B": se renombran conservando su contenido.
function addFullBodyDays(data){
  if(data.fullBodyVersion === PLAN.fullBodyVersion) return;
  const renamed = {"Complemento - Full Body A": "Full Body A", "Complemento - Full Body B": "Full Body B"};
  data.days = data.days.map(d => renamed[d] || d).filter((d, i, arr) => arr.indexOf(d) === i);
  Object.values(data.routine).forEach(week => Object.entries(renamed).forEach(([oldKey, newKey]) => {
    if(week[oldKey]){ if(!week[newKey]) week[newKey] = week[oldKey]; delete week[oldKey]; }
  }));
  const fbDays = PLAN.days.filter(d => d.startsWith("Full Body "));
  fbDays.forEach(day => {
    if(!data.days.includes(day)) data.days.push(day);
    PLAN.weeks.forEach(w => {
      if(!data.routine[w]) return;
      if(!Array.isArray(data.routine[w][day]) || !data.routine[w][day].length) data.routine[w][day] = clone(PLAN.routine[w][day] || []);
    });
  });
  data.fullBodyVersion = PLAN.fullBodyVersion;
}

function normalizeSet(set, idx){
  const w = normalizeSetWeight(set);
  const out = {
    set: set.set || idx+1,
    weight: w.weight,
    unit: w.unit,
    weightNote: w.weightNote,
    repsDone: String(set.repsDone || set.reps || ""),
    rir: set.rir || set.rpe || "",
    feeling: set.feeling || "",
    rest: set.rest || "",
    pain: String(set.pain ?? "0") || "0",
    done: false
  };
  out.done = Boolean(set.done) || setHasData(out);
  return out;
}

function normalizeState(data){
  const base = seedState();
  data = {...base, ...data};
  data.settings = {...base.settings, ...(data.settings || {})};
  data.weeks = data.weeks?.length ? data.weeks : base.weeks;
  data.days = data.days?.length ? data.days : base.days;
  data.routine = data.routine || {};
  data.sessions = Array.isArray(data.sessions) ? data.sessions : [];
  data.cardio = Array.isArray(data.cardio) ? data.cardio : base.cardio;
  data.weightLog = Array.isArray(data.weightLog) ? data.weightLog : [];
  data.prs = {...base.prs, ...(data.prs || {})};
  data.autoPRs = data.autoPRs || {};
  data.weeklyTargets = data.weeklyTargets || {};
  data.meta = {...(data.meta || {})};
  data.blockStatus = {...(base.blockStatus || {}), ...(data.blockStatus || {})};

  // Datos específicos confirmados de Martín: plan 6 semanas + Semana 2.5 real.
  if(!data.martinBlockSeeded || data.planVersion !== PLAN.version){
    PLAN.weeks.forEach((w, i) => {
      if(!data.weeks.includes(w)){
        const prev = PLAN.weeks.slice(0, i).reverse().find(p => data.weeks.includes(p));
        data.weeks.splice(prev ? data.weeks.indexOf(prev) + 1 : 0, 0, w);
      }
      // Solo se reemplaza la rutina si no existe o sigue siendo la base antigua sin editar.
      if(isLegacyDefaultRoutine(data.routine[w], w, data.days)){
        data.routine[w] = clone(PLAN.routine[w]);
        data.weeklyTargets[w] = clone(PLAN.weeklyTargets[w]);
      } else if(!data.weeklyTargets[w]){
        data.weeklyTargets[w] = clone(PLAN.weeklyTargets[w]);
      }
    });

    const existingIds = new Set(data.sessions.map(s => s.id));
    clone(PLAN.seedSessions).forEach(s => {
      if(!existingIds.has(s.id)) data.sessions.push(s);
    });

    data.blockStatus = clone(PLAN.blockStatus);
    data.martinBlockSeeded = true;
    data.planVersion = PLAN.version;
  }
  applyMuscleFixes(data);
  addFullBodyDays(data);
  data.ui = { sidebarCompact: false, ...(data.ui || {}) };

  data.weeks.forEach(week => {
    if(!data.routine[week]) data.routine[week] = {};
    data.days.forEach(day => {
      if(!Array.isArray(data.routine[week][day])) data.routine[week][day] = baseExercises(day, week);
      data.routine[week][day] = data.routine[week][day].map(e => ({...e, muscle: normalizeMuscle(e.muscle)}));
    });
    if(!data.weeklyTargets[week]) data.weeklyTargets[week] = defaultTargetsFromPlan(data, week);
  });

  data.weightLog = data.weightLog.map((w, i) => ({
    date: w.date || "",
    week: w.week || w.date || `Registro ${i+1}`,
    avg: w.avg || w.weight || "",
    min: w.min || "",
    max: w.max || "",
    waist: w.waist || "",
    notes: w.notes || w.energy || ""
  }));

  data.sessions = data.sessions.map(s => ({
    id: s.id || Date.now() + Math.floor(Math.random()*9999),
    date: s.date || new Date().toLocaleString("es-CL"),
    createdAt: s.createdAt || "",
    session: s.session || "",
    weekday: s.weekday || "",
    week: s.week || data.selectedWeek,
    day: s.day || data.selectedDay,
    readiness: s.readiness || {status:"Sin dato"},
    exercises: (s.exercises || []).map(e => ({
      name: e.name || "Ejercicio",
      muscle: normalizeMuscle(e.muscle),
      target: e.target || e.planned?.target || "",
      actualSets: e.actualSets || e.sets?.length || e.planned?.sets || 0,
      isAdded: Boolean(e.isAdded || e.isAlternative),
      isAlternative: Boolean(e.isAdded || e.isAlternative),
      note: e.note || "",
      sets: (e.sets || []).map(normalizeSet)
    })),
    notes: s.notes || ""
  }));

  if(!data.selectedWeek || !data.weeks.includes(data.selectedWeek)) data.selectedWeek = data.weeks[0];
  if(!data.selectedDay || !data.days.includes(data.selectedDay)) data.selectedDay = data.days[2] || data.days[0];
  if(!WEEKDAYS.includes(data.selectedWeekday)) data.selectedWeekday = weekdayOf(data.selectedDay) || WEEKDAYS[0];
  return data;
}

// Se llama una vez que `state` está asignado (usa funciones de dominio que leen el estado global).
function finishStateLoad(){
  if(state.meta.autoPRsVersion !== 1){
    recomputeAutoPRs();
    state.meta.autoPRsVersion = 1;
  }
}

function defaultTargetsFromPlan(dataObj, week){
  const out = {};
  Object.values(dataObj.routine?.[week] || {}).flat().forEach(e => {
    const m = normalizeMuscle(e.muscle);
    out[m] = (out[m] || 0) + Number(e.sets || 0);
  });
  MUSCLE_GROUPS.forEach(m => { if(out[m] === undefined) out[m] = 0; });
  return out;
}

let storageWarned = false;

// options.touch=false guarda sin marcar un cambio (p. ej. al registrar la fecha del último respaldo).
function saveState(options = {}){
  if(options.touch !== false) state.meta.updatedAt = new Date().toISOString();
  const ok = storageSet("localStorage", STORAGE_KEY, JSON.stringify(state));
  if(!ok && !storageWarned){
    storageWarned = true;
    alert("No pude guardar en este navegador (almacenamiento lleno o bloqueado). Exporta un respaldo JSON para no perder datos.");
  }
  if(ok) storageWarned = false;
}

/* ---------- Borrador de Registrar (sobrevive a recargas) ---------- */

function saveDraftToStorage(){
  if(!draftHasData()){
    storageRemove("localStorage", DRAFT_KEY);
    return;
  }
  storageSet("localStorage", DRAFT_KEY, JSON.stringify({
    week: state.selectedWeek,
    day: state.selectedDay,
    weekday: state.selectedWeekday,
    draft: trainingDraft,
    notes: $("#sessionNotes")?.value || "",
    savedAt: new Date().toISOString()
  }));
}

function loadDraftFromStorage(){
  const raw = storageGet("localStorage", DRAFT_KEY);
  if(!raw) return null;
  try {
    const d = JSON.parse(raw);
    return Array.isArray(d.draft) ? d : null;
  } catch(e){ return null; }
}

function clearDraftStorage(){ storageRemove("localStorage", DRAFT_KEY); }

/* ---------- Respaldo ---------- */

function needsBackupReminder(){
  if(!state.sessions.some(s => s.createdAt)) return false;
  return daysSince(state.meta.lastBackupAt) > BACKUP_REMINDER_DAYS;
}
