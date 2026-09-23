// Reglas de entrenamiento: músculos, catálogo de ejercicios, cargas, 1RM, RIR, sugerencias y alertas.
const MUSCLE_GROUPS = ["cuádriceps","glúteo","isquios","posterior/hinge","pecho","espalda/dorsal","deltoide lateral","bíceps","tríceps","gemelos","core/control","escápula/manguito","cardio","recuperación","general"];
const LBS_TO_KG = 0.45359237;
const LBS_RE = /(?:\d|\b)(?:lbs?|libras?)\b/i;
const PAIN_ALERT_THRESHOLD = 3;
const PAIN_ALERT_SESSIONS = 3;

function normalizeMuscle(muscle){
  const raw = stripAccents(String(muscle || "general").toLowerCase()).trim();

  if(raw.includes("cuad") || raw.includes("quad") || raw.includes("pierna")) return "cuádriceps";
  if(raw.includes("glut")) return "glúteo";
  if(raw.includes("isqu") || raw.includes("femoral") || raw.includes("hamstring")) return "isquios";
  if(raw.includes("posterior") || raw.includes("hinge") || raw.includes("rdl") || raw.includes("peso muerto") || raw.includes("bisagra")) return "posterior/hinge";
  if(raw.includes("pecho") || raw.includes("press")) return "pecho";
  if(raw.includes("espalda") || raw.includes("dorsal") || raw.includes("remo") || raw.includes("jalon") || raw.includes("dominada")) return "espalda/dorsal";
  if(raw.includes("deltoide") || raw.includes("hombro") || raw.includes("lateral")) return "deltoide lateral";
  if(raw.includes("biceps") || raw.includes("curl")) return "bíceps";
  if(raw.includes("triceps") || raw.includes("pushdown") || raw.includes("extension")) return "tríceps";
  if(raw.includes("gemelo") || raw.includes("soleo") || raw.includes("calf")) return "gemelos";
  if(raw.includes("core") || raw.includes("control") || /\babs?\b|abdom/.test(raw) || raw.includes("carry")) return "core/control";
  if(raw.includes("escap") || raw.includes("manguito") || raw.includes("rotador")) return "escápula/manguito";
  if(raw.includes("cardio") || raw.includes("trote") || raw.includes("zona")) return "cardio";
  if(raw.includes("recuper") || raw.includes("movilidad") || raw.includes("descanso")) return "recuperación";

  const exact = MUSCLE_GROUPS.find(m => stripAccents(m).toLowerCase() === raw);
  return exact || "general";
}

/* ---------- Día de la semana y sesión ---------- */

const WEEKDAYS = ["Lunes","Martes","Miércoles","Jueves","Viernes","Sábado","Domingo"];
const SESSION_ORDER = ["Lower A","Lower B","Upper A","Upper B","Full Body A","Full Body B","Cardio suave","Trote opcional","Descanso"];

// Las rutinas se guardan por sesión con su día habitual ("Martes - Lower A"); los full body no tienen día fijo.
function sessionLabel(key){
  const k = String(key ?? "");
  return WEEKDAYS.some(w => k.startsWith(w + " - ")) ? k.slice(k.indexOf(" - ") + 3) : k;
}
function weekdayOf(key){ return WEEKDAYS.find(w => String(key ?? "").startsWith(w + " - ")) || null; }
function defaultSessionFor(weekday, days){ return days.find(k => weekdayOf(k) === weekday) || null; }
function sortedSessions(days){
  const rank = k => { const i = SESSION_ORDER.indexOf(sessionLabel(k)); return i === -1 ? SESSION_ORDER.length : i; };
  return [...days].sort((a, b) => rank(a) - rank(b) || days.indexOf(a) - days.indexOf(b));
}

/* ---------- Catálogo de ejercicios ---------- */

let aliasIndex = null;

function exerciseKeyBase(name){
  return stripAccents(String(name ?? "").toLowerCase())
    .replace(/\bmanc\b\.?/g, "mancuernas")
    .replace(/\bdb\b/g, "mancuernas")
    .replace(/[.,;:]+$/g, "")
    .replace(/\s*\/\s*/g, "/")
    .replace(/\s+/g, " ")
    .trim();
}

function buildAliasIndex(){
  aliasIndex = {};
  Object.entries(PLAN?.exerciseAliases || {}).forEach(([canonical, aliases]) => {
    const key = exerciseKeyBase(canonical);
    aliasIndex[key] = key;
    aliases.forEach(a => { aliasIndex[exerciseKeyBase(a)] = key; });
  });
}

// Clave estable para reconocer el mismo ejercicio aunque cambie cómo se escribe.
function canonicalExercise(name){
  if(!aliasIndex) buildAliasIndex();
  const key = exerciseKeyBase(name);
  return aliasIndex[key] || key;
}

/* ---------- Carga: número + unidad ---------- */

function parseWeightText(text){
  const s = String(text ?? "").trim();
  if(!s) return {weight:"", unit:"kg", weightNote:""};
  const unit = LBS_RE.test(s) ? "lbs" : "kg";
  const m = s.replace(/(\d),(\d)/g, "$1.$2").match(/-?\d+(?:\.\d+)?/);
  if(!m) return {weight:"", unit, weightNote:s};
  const rest = s.replace(/(\d),(\d)/g, "$1.$2")
    .replace(m[0], "")
    .replace(/\b(kg|kgs|kilos?|lb|lbs|libras?)\b/i, "")
    .replace(/^[\s,;:x-]+|[\s,;:-]+$/g, "")
    .replace(/\s+/g, " ")
    .trim();
  return {weight: String(Number(m[0])), unit, weightNote: rest};
}

// Normaliza una serie (datos nuevos o de versiones antiguas con peso en texto libre).
function normalizeSetWeight(set){
  const hasUnit = set.unit === "kg" || set.unit === "lbs";
  if(hasUnit && (set.weight === "" || parseNumber(set.weight) !== null)){
    return {weight: set.weight === "" ? "" : String(parseNumber(set.weight)), unit: set.unit, weightNote: set.weightNote || ""};
  }
  const parsed = parseWeightText(set.weight);
  if(hasUnit && !/(?:\d|\b)(kg|lb)/i.test(String(set.weight))) parsed.unit = set.unit;
  if(set.weightNote) parsed.weightNote = [parsed.weightNote, set.weightNote].filter(Boolean).join(" ");
  return parsed;
}

// Series reales de un ejercicio del plan: "1 top + 2 backoff" son 3 series, no 1.
// `sets` en el JSON del plan quedó como el primer número; esto lee `seriesSpec` (el texto completo del Excel) para no perder series.
function resolvedSetCount(e){
  const spec = String(e?.seriesSpec ?? "").trim();
  const fallback = Number(e?.sets) || 3;
  if(!spec) return fallback;
  if(/top|backoff|test/i.test(spec)){
    const nums = [...spec.matchAll(/(\d+)\s*(?:top|backoff|test)/gi)].map(m => Number(m[1]));
    if(nums.length) return nums.reduce((a,b) => a+b, 0);
  }
  const plus = spec.match(/^(\d+)(?:-(\d+))?\s*\+\s*(\d+)/);
  if(plus) return Number(plus[2] || plus[1]) + Number(plus[3]);
  return fallback;
}

function toKg(set){
  const n = parseNumber(set?.weight);
  if(n === null) return null;
  return set.unit === "lbs" ? n * LBS_TO_KG : n;
}

function formatSetWeight(set){
  const n = parseNumber(set?.weight);
  const main = n === null ? "" : `${formatNumber(n, 2)} ${set.unit || "kg"}`;
  return [main, set?.weightNote].filter(Boolean).join(" ") || "—";
}

// Unidad inicial de un ejercicio en Registrar: la de la carga planificada si dice lbs,
// si no la de la última serie registrada de ese ejercicio y, por defecto, kg.
function defaultExerciseUnit(ex){
  if(LBS_RE.test(String(ex?.load ?? ""))) return "lbs";
  const prev = ex?.name ? findPreviousExercise(ex.name) : null;
  return prev?.sets?.at(-1)?.unit === "lbs" ? "lbs" : "kg";
}

function setHasData(s){
  return Boolean(s && (s.done || String(s.weight ?? "").trim() || String(s.repsDone ?? "").trim() || String(s.weightNote ?? "").trim()));
}

/* ---------- Rendimiento ---------- */

// Reps solo si el texto empieza con un número ("10 por pierna" → 10; "similar S1" → null).
function repsCount(text){
  return /^\s*\d/.test(String(text ?? "")) ? firstNumber(text) : null;
}

// 1RM estimado (Epley). Solo con peso numérico y 1-15 reps.
function epley1RM(kg, reps){
  const load=Number(kg), r=Number(reps);
  if(!Number.isFinite(load) || load<=0 || !Number.isFinite(r) || r<1 || r>15) return null;
  return r===1 ? load : load + (load * r * 0.03);
}

function estimate1RM(set){
  const kg = toKg(set);
  const reps = repsCount(set?.repsDone);
  if(!kg || !reps || reps < 1 || reps > 15) return null;
  return epley1RM(kg, reps);
}

function setVolumeKg(set){
  const kg = toKg(set);
  const reps = repsCount(set?.repsDone);
  return kg && reps ? kg * reps : 0;
}

// Mejor serie: mayor 1RM estimado; si no se puede calcular, mayor peso y luego más reps.
function bestSet(sets){
  const valid = (sets || []).filter(setHasData);
  if(!valid.length) return null;
  return valid.reduce((best, s) => {
    if(!best) return s;
    const a = estimate1RM(s), b = estimate1RM(best);
    if(a !== null || b !== null) return (a ?? -1) > (b ?? -1) ? s : best;
    const dw = (toKg(s) ?? -1) - (toKg(best) ?? -1);
    if(dw !== 0) return dw > 0 ? s : best;
    return (repsCount(s.repsDone) ?? -1) > (repsCount(best.repsDone) ?? -1) ? s : best;
  }, null);
}

// RIR numérico desde texto: "RIR 2-3" → 2.5, "@7" / "RPE 8" → 10-RPE, "muchos" → 5.
function parseRir(text){
  const t = stripAccents(String(text ?? "").toLowerCase()).trim();
  if(!t) return null;
  if(t.includes("mucho")) return 5;
  const range = t.replace(",", ".").match(/(\d+(?:\.\d+)?)(?:\s*-\s*(\d+(?:\.\d+)?))?/);
  if(!range) return null;
  const value = range[2] ? (Number(range[1]) + Number(range[2])) / 2 : Number(range[1]);
  if(t.includes("rpe") || t.startsWith("@")) return Math.max(0, 10 - value);
  return value;
}

/* ---------- Historial ---------- */

function sessionsChronological(){
  return state.sessions.map((s, i) => ({s, i}))
    .sort((a, b) => {
      const ta = a.s.createdAt ? new Date(a.s.createdAt).getTime() : null;
      const tb = b.s.createdAt ? new Date(b.s.createdAt).getTime() : null;
      if(ta !== null && tb !== null) return ta - tb;
      return a.i - b.i;
    })
    .map(x => x.s);
}

function exerciseHistory(name){
  const key = canonicalExercise(name);
  const out = [];
  sessionsChronological().forEach(s => {
    (s.exercises || []).forEach(e => {
      if(canonicalExercise(e.name) !== key) return;
      const sets = (e.sets || []).filter(setHasData);
      if(sets.length) out.push({session: s, exercise: e, sets});
    });
  });
  return out;
}

function findPreviousExercise(name){
  const hist = exerciseHistory(name);
  return hist.length ? hist[hist.length - 1] : null;
}

function exerciseCatalog(){
  const map = {};
  sessionsChronological().forEach(s => (s.exercises || []).forEach(e => {
    if(!(e.sets || []).some(setHasData)) return;
    map[canonicalExercise(e.name)] = e.name;
  }));
  return Object.entries(map).map(([key, name]) => ({key, name})).sort((a, b) => a.name.localeCompare(b.name, "es"));
}

/* ---------- Alertas de dolor ---------- */

const PAIN_ZONES = [
  {key:"shoulder", label:"Hombro", advice:"baja el volumen de press y evita el fallo"},
  {key:"neck", label:"Cervical/Lumbar", advice:"evita sentadilla libre y bisagras pesadas"},
  {key:"ham", label:"Isquio/Glúteo", advice:"baja tirones pesados y evita trote intenso"}
];

function painAlerts(){
  const alerts = [];
  const sessions = sessionsChronological();

  PAIN_ZONES.forEach(zone => {
    const values = sessions.map(s => parseNumber(s.readiness?.[zone.key])).filter(v => v !== null);
    const last = values.slice(-PAIN_ALERT_SESSIONS);
    if(last.length === PAIN_ALERT_SESSIONS && last.every(v => v > PAIN_ALERT_THRESHOLD)){
      alerts.push(`${zone.label}: ${PAIN_ALERT_SESSIONS} sesiones seguidas sobre ${PAIN_ALERT_THRESHOLD}/10 (${last.join(", ")}). Conviene ${zone.advice}.`);
    }
  });

  exerciseCatalog().forEach(({name}) => {
    const hist = exerciseHistory(name).slice(-PAIN_ALERT_SESSIONS);
    if(hist.length < PAIN_ALERT_SESSIONS) return;
    const maxes = hist.map(h => Math.max(0, ...h.sets.map(s => parseNumber(s.pain) ?? 0)));
    if(maxes.every(v => v > PAIN_ALERT_THRESHOLD)){
      alerts.push(`${name}: dolor sobre ${PAIN_ALERT_THRESHOLD}/10 en las últimas ${PAIN_ALERT_SESSIONS} sesiones (${maxes.join(", ")}). Cambia a una variante sin dolor.`);
    }
  });
  return alerts;
}

/* ---------- PRs automáticos ---------- */

// Devuelve los nuevos récords (1RM estimado) que aporta una sesión respecto del historial previo.
function detectPRs(session){
  const found = [];
  (session.exercises || []).forEach(e => {
    const best = bestSet(e.sets);
    const e1rm = best ? estimate1RM(best) : null;
    if(!e1rm) return;
    const key = canonicalExercise(e.name);
    const current = state.autoPRs[key];
    if(!current || e1rm > current.e1rm + 0.01){
      found.push({key, name: e.name, e1rm, weight: best.weight, unit: best.unit, reps: best.repsDone, date: session.date, previous: current?.e1rm ?? null});
    }
  });
  return found;
}

function recomputeAutoPRs(){
  state.autoPRs = {};
  sessionsChronological().forEach(s => detectPRs(s).forEach(pr => { state.autoPRs[pr.key] = pr; }));
}

/* ---------- Semáforo ---------- */

const SLEEP_SCORE = {bueno: 3, medio: 2, malo: 1};

function readinessStatus({sleep, energy, shoulder, neck, ham, motivation}){
  const maxPain = Math.max(shoulder, neck, ham);
  if(maxPain >= 5 || energy <= 1){
    return {status:"red", label:"Peligro", msg:"Alerta estructural. Reducir volumen 30-40%, evitar fallo y usar alternativas seguras."};
  }
  if(maxPain >= 3 || sleep === "malo" || energy <= 2 || motivation <= 2){
    return {status:"yellow", label:"Precaución", msg:"Limitar picos de intensidad. Mantener cargas previas, bajar una serie si hace falta."};
  }
  return {status:"green", label:"Óptimo", msg:"Sistema nominal. Progresión habilitada según RIR."};
}
