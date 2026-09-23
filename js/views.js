// Vistas: inicio, rutina, historial, progreso, cardio, peso corporal y ajustes.
const charts = {};

const PAGE_META = {
  inicio: { title: "Inicio", subtitle: "Panel principal de control y estado actual del bloque." },
  rutina: { title: "Rutina Base", subtitle: "Configura la estructura semanal, ejercicios y planificación del bloque." },
  entrenar: { title: "Registrar", subtitle: "Registra la sesión real, cargas, RIR, dolor y observaciones." },
  historial: { title: "Historial", subtitle: "Revisa sesiones pasadas, ejercicios completados y notas previas." },
  progreso: { title: "Progreso", subtitle: "Analiza objetivos semanales, volumen registrado y tendencias." },
  cardio: { title: "Cardio", subtitle: "Lleva control de trote, zona 2, spinning y trabajo cardiovascular." },
  nutricion: { title: "Peso Corporal", subtitle: "Registra peso corporal y sigue la tendencia semanal o diaria." },
  ajustes: { title: "Ajustes", subtitle: "Administra perfil, respaldo y parámetros del sistema." }
};

function currentView(){
  return document.body.className.match(/bg-([a-z]+)/)?.[1] || "inicio";
}

function refreshTopMeta(view){
  const meta = PAGE_META[view] || PAGE_META.inicio;
  $("#pageTitle").textContent = meta.title;
  $("#pageSubtitle").textContent = meta.subtitle;
  $("#ribbonGoal").textContent = state.settings?.mainGoal || "Recomposición + fuerza";
  $("#ribbonWeakness").textContent = state.settings?.deadliftWeakness || "Bloqueo final";
}

function renderAll(){
  renderHome();
  renderRoutine();
  renderTraining();
  renderHistory();
  renderProgress();
  renderCardio();
  renderWeight();
  renderBlockStatus();
  loadSettingsToForm();
  applyOwnerName();
  refreshTopMeta(currentView());
}

function applyOwnerName(){
  $(".watermark").textContent = `${state.settings.ownerName || "Martin Reyes"} · PRIME OS`.toUpperCase();
}

/* ---------- Gráficos ---------- */

const CHART_COLORS = {primary:"#2f81f7", green:"#3fb950", yellow:"#d29922", red:"#f85149", purple:"#a371f7", text:"#c9d1d9", muted:"#8b949e", grid:"#30363d"};

function drawChart(id, config, fallbackId){
  const canvas = document.getElementById(id);
  if(!canvas) return;
  if(charts[id]){ charts[id].destroy(); delete charts[id]; }
  const fallback = fallbackId ? document.getElementById(fallbackId) : null;
  if(typeof Chart === "undefined"){
    if(fallback) fallback.textContent = "No se pudo cargar la librería de gráficos.";
    return;
  }
  // Un canvas oculto mide 0: se dibuja cuando su vista está visible.
  if(!canvas.offsetParent) return;
  if(fallback) fallback.textContent = "";
  const base = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { labels: { color: CHART_COLORS.text } } },
    scales: {
      y: { grid: { color: CHART_COLORS.grid }, ticks: { color: CHART_COLORS.muted } },
      x: { grid: { color: "#21262d" }, ticks: { color: CHART_COLORS.muted, maxRotation: 45 } }
    }
  };
  config.options = {...base, ...(config.options || {}), scales: {...base.scales, ...(config.options?.scales || {})}};
  charts[id] = new Chart(canvas.getContext("2d"), config);
}

/* ---------- Inicio ---------- */

function renderHome(){
  $("#todayRoutineTitle").textContent = `${state.selectedWeekday} · ${sessionLabel(state.selectedDay)} · ${state.selectedWeek}`;
  $("#todaySummary").textContent = selectedRoutine().map(e=>e.name).join(" / ") || "Sin carga de ejercicios planificada.";
  $("#totalSessions").textContent = state.sessions.length;
  $("#weekCompletion").textContent = `${weeklyCompletion(state.selectedWeek)}%`;
  const lastWeight = getLastWeight();
  $("#lastBodyWeight").textContent = lastWeight ? `${lastWeight} kg` : "—";
  renderReadiness();
  $("#homeMuscleBars").innerHTML = muscleBarsHTML(state.selectedWeek);
  renderAlerts();
}

function renderAlerts(){
  const box = $("#alertsBox");
  const items = painAlerts().map(a => `<div class="alert-item danger-alert">⚠️ ${escapeHtml(a)}</div>`);
  if(needsBackupReminder()){
    const days = state.meta.lastBackupAt ? `Tu último respaldo fue hace ${Math.floor(daysSince(state.meta.lastBackupAt))} días.` : "Aún no has descargado ningún respaldo.";
    items.unshift(`<div class="alert-item backup-alert">💾 ${days} Tus datos solo están en este navegador.
      <span class="alert-actions"><button type="button" class="primary export-json-btn">Descargar respaldo</button></span></div>`);
  }
  box.innerHTML = items.join("");
  box.classList.toggle("hidden", !items.length);
  box.querySelectorAll(".export-json-btn").forEach(b => b.addEventListener("click", exportJson));
}

function getLastWeight(){
  const valid = state.weightLog.filter(w => parseNumber(w.avg) !== null);
  if(!valid.length) return null;
  return valid[valid.length-1].avg;
}

// Campo vacío = valor neutro (evita que el semáforo salte a rojo mientras se escribe).
function readScale(sel, min, max, fallback){
  const n = parseNumber($(sel)?.value);
  if(n === null) return fallback;
  return Math.min(max, Math.max(min, n));
}

function renderReadiness(){
  const values = {
    sleep: $("#sleepInput").value,
    energy: readScale("#energyInput", 1, 5, 3),
    shoulder: readScale("#shoulderPainInput", 0, 10, 0),
    neck: readScale("#neckPainInput", 0, 10, 0),
    ham: readScale("#hamPainInput", 0, 10, 0),
    motivation: readScale("#motivationInput", 1, 5, 3)
  };
  const {status, label, msg} = readinessStatus(values);
  $("#readinessBadge").className = `badge ${status}`;
  $("#readinessBadge").textContent = label;
  $("#decisionBox").className = `decision ${status}`;
  $("#decisionBox").textContent = msg;
  $("#assistantAdvice").textContent = makeAdvice(status, values.shoulder, values.neck, values.ham);
}

function makeAdvice(status, shoulder, neck, ham){
  const day = state.selectedDay;
  if(status === "red") return "Hoy no busques PR. Haz técnica, movilidad y top sets controlados. Si algo duele más de 5/10, cambia el patrón por un ejercicio agregado seguro.";
  if(day.includes("Upper") && shoulder >= 3) return "Hombro en zona amarilla: mantén press en rango cómodo, sin fallo. Usa Agregar si cambias banca/inclinado por máquina, fondos asistidos o variante sin dolor.";
  if(day.includes("Lower") && neck >= 3) return "Cervical/lumbar sensible: evita sentadilla libre pesada. Agrega prensa, hack o pausa liviana si cambias el patrón.";
  if(day.includes("Lower") && ham >= 3) return "Isquio/glúteo sensible: baja tirones fuertes y evita trote intenso. Prioriza técnica y control.";
  if(day.includes("Full Body")) return "Full body de complemento: solo suma las series que faltan para tu objetivo semanal. Sesión corta, sin fallo y sin cargar espalda ni cuello. Si ese día hay dolor sobre 3/10, sáltalo: es opcional.";
  if(day.includes("Lower B")){
    const hinge = selectedRoutine().find(e => normalizeMuscle(e.muscle) === "posterior/hinge");
    const load = hinge?.load && hinge.load !== "—" ? ` (${hinge.load})` : "";
    return `Bisagra principal: ${hinge?.name || "RDL / peso muerto técnico"}${load}. Una sola bisagra pesada, sin fallo y cuidando el bloqueo final.`;
  }
  return "Zona buena: busca igualar o mejorar una repetición respecto a la sesión anterior sin romper técnica ni pasar el RIR objetivo.";
}

function renderBlockStatus(){
  const box = $("#blockStatusList");
  box.innerHTML = `<div class="block-status-grid">${state.weeks.map(w => {
    const meta = state.blockStatus?.[w] || {status:"base", note:"Base editable."};
    const sessions = state.sessions.filter(s => s.week === w).length;
    const statusClass = meta.status === "real" ? "status-real" : meta.status === "empty" ? "status-empty" : "status-base";
    const label = meta.status === "real" ? "real" : meta.status === "empty" ? "vacía" : "base";
    return `<div class="status-pill-card">
      <strong>${escapeHtml(w)}</strong>
      <span class="${statusClass}">${label}</span>
      <small>${sessions} sesiones · ${escapeHtml(meta.note || "")}</small>
    </div>`;
  }).join("")}</div>`;
}

/* ---------- Rutina ---------- */

function muscleOptions(selected){
  return MUSCLE_GROUPS.map(m=>`<option value="${escapeAttr(m)}" ${normalizeMuscle(selected)===m?"selected":""}>${escapeHtml(m)}</option>`).join("");
}

function renderRoutine(){
  $("#routineList").innerHTML = selectedRoutine().map((e,i) => `
    <div class="exercise-card">
      <div class="exercise-head">
        <div>
          <h4>${escapeHtml(e.name)}</h4>
          <div class="exercise-meta">
            <span class="pill">${Number(e.sets)||0} series</span>
            <span class="pill">${escapeHtml(e.reps)}</span>
            <span class="pill">${escapeHtml(e.load)}</span>
            <span class="pill">${escapeHtml(e.target)}</span>
            <span class="pill">${escapeHtml(e.muscle)}</span>
          </div>
        </div>
        <button class="ghost" onclick="removeExercise(${i})">Eliminar</button>
      </div>
      <div class="form-grid">
        <label>Ejercicio <input value="${escapeAttr(e.name)}" onchange="updateExercise(${i}, 'name', this.value)"></label>
        <label>Músculo
          <select onchange="updateExercise(${i}, 'muscle', this.value)">${muscleOptions(e.muscle)}</select>
        </label>
        <label>Series <input type="number" min="1" max="10" value="${Number(e.sets)||1}" onchange="updateExercise(${i}, 'sets', Number(this.value))"></label>
        <label>Reps <input value="${escapeAttr(e.reps)}" onchange="updateExercise(${i}, 'reps', this.value)"></label>
        <label>Carga <input value="${escapeAttr(e.load)}" onchange="updateExercise(${i}, 'load', this.value)"></label>
        <label>RIR/RPE <input value="${escapeAttr(e.target)}" onchange="updateExercise(${i}, 'target', this.value)"></label>
        <label class="wide">Nota <input value="${escapeAttr(e.note || "")}" onchange="updateExercise(${i}, 'note', this.value)"></label>
      </div>
    </div>
  `).join("");
}

// Editar la rutina solo reinicia Registrar si no hay datos escritos (para no perder el borrador).
function afterRoutineEdit(){
  saveState();
  if(!draftHasData()) resetTrainingDraft();
  renderAll();
}

window.updateExercise = function(i, k, v){
  collectDraftInputs();
  state.routine[state.selectedWeek][state.selectedDay][i][k] = k === "muscle" ? normalizeMuscle(v) : v;
  afterRoutineEdit();
};
window.removeExercise = function(i){
  collectDraftInputs();
  state.routine[state.selectedWeek][state.selectedDay].splice(i,1);
  afterRoutineEdit();
};
function addExercise(){
  collectDraftInputs();
  state.routine[state.selectedWeek][state.selectedDay].unshift({name:"Nuevo ejercicio", sets:3, reps:"8-10", load:"—", target:"RIR 2", muscle:"general", note:""});
  afterRoutineEdit();
  $("#routineList .exercise-card")?.scrollIntoView({behavior: "smooth", block: "start"});
}

/* ---------- Historial ---------- */

function renderHistory(){
  const q = ($("#historySearch")?.value || "").toLowerCase();
  const sessions = [...sessionsChronological()].reverse().filter(s => JSON.stringify(s).toLowerCase().includes(q));
  $("#historyList").innerHTML = sessions.length ? sessions.map(s => `
    <div class="history-card">
      <div class="exercise-head">
        <div>
          <h4>${escapeHtml(s.day)}</h4>
          <p class="small-muted">${escapeHtml(s.date)} · ${escapeHtml(s.week)} · Estado: ${escapeHtml(s.readiness?.status || "—")}</p>
        </div>
        <button class="danger" onclick="deleteSession('${escapeAttr(String(s.id))}')">Borrar</button>
      </div>
      ${s.exercises.map(e => {
        const validSets = e.sets.filter(setHasData);
        if(validSets.length === 0) return "";
        const vol = validSets.reduce((a, x) => a + setVolumeKg(x), 0);
        return `<p class="history-exercise">
          <strong>${escapeHtml(e.name)}${e.isAdded ? " · agregado" : ""}:</strong>
          ${validSets.map(x=> `${escapeHtml(formatSetWeight(x))} x ${escapeHtml(x.repsDone||"-")} (${escapeHtml(x.rir||"RIR -")}) · ${escapeHtml(x.feeling||"sin sensación")} · descanso ${escapeHtml(x.rest||"-")} · dolor ${escapeHtml(x.pain||"0")}/10`).join(" | ")}
          ${vol ? `<br><span class="small-muted">Volumen: ${formatNumber(vol, 0)} kg</span>` : ""}
          ${e.note ? `<br><span class="small-muted">Nota: ${escapeHtml(e.note)}</span>` : ""}
        </p>`;
      }).join("")}
      ${s.notes ? `<div class="compare-box">General: ${escapeHtml(s.notes)}</div>` : ""}
    </div>
  `).join("") : `<p class="small-muted">Base de datos vacía.</p>`;
}

window.deleteSession = function(id){
  const session = state.sessions.find(s => String(s.id) === String(id));
  if(!session) return;
  if(!confirm(`¿Borrar la sesión "${session.day}" (${session.week} · ${session.date})? No se puede deshacer.`)) return;
  state.sessions = state.sessions.filter(s => String(s.id) !== String(id));
  state.meta.deletedSessionIds = [...new Set([...(state.meta.deletedSessionIds || []), String(id)])];
  recomputeAutoPRs();
  saveState(); renderAll();
};

/* ---------- Progreso ---------- */

function weeklyTargetSets(week){
  if(!state.weeklyTargets[week]) state.weeklyTargets[week] = defaultTargetsFromPlan(state, week);
  return state.weeklyTargets[week];
}

function completedMuscleSets(week){
  const out = {};
  state.sessions.filter(s=>s.week===week).forEach(s=>{
    s.exercises.forEach(e=>{
      const doneSets = e.sets.filter(setHasData).length;
      const m = normalizeMuscle(e.muscle);
      out[m] = (out[m] || 0) + doneSets;
    });
  });
  return out;
}

function weeklyCompletion(week){
  const target = weeklyTargetSets(week);
  const done = completedMuscleSets(week);
  const p = Object.values(target).reduce((a,b)=>a+Number(b||0),0);
  const d = Object.entries(done).reduce((sum,[m,v]) => sum + Math.min(v, Number(target[m]||0)), 0);
  return p ? Math.min(100, Math.round(d/p*100)) : 0;
}

function muscleBarsHTML(week){
  const target = weeklyTargetSets(week), done = completedMuscleSets(week);
  const muscles = Array.from(new Set([...Object.keys(target),...Object.keys(done)])).filter(m => Number(target[m]||0) > 0 || Number(done[m]||0) > 0).sort();
  if(!muscles.length) return "<p class='small-muted'>Sin datos activos.</p>";
  return muscles.map(m=>{
    const p = Number(target[m] || 0), d = Number(done[m] || 0);
    const pct = p ? Math.min(100,Math.round(d/p*100)) : 0;
    const color = pct >= 80 ? "green" : pct >= 40 ? "yellow" : "";
    return `<div class="progress-row">
      <strong>${escapeHtml(m)}</strong>
      <div>
        <span class="small-muted">${d}/${p || "sin objetivo"} series semanales · ${p ? pct+"%" : "objetivo no definido"}</span>
        <div class="progress-bar ${color}"><span style="width:${p ? pct : 0}%"></span></div>
      </div>
    </div>`;
  }).join("");
}

function renderTargetsEditor(){
  const target = weeklyTargetSets(state.selectedWeek);
  $("#weeklyTargetsEditor").innerHTML = `
    <div class="form-grid three">
      ${MUSCLE_GROUPS.map(m => `
        <label>${escapeHtml(m)}
          <input type="number" min="0" max="40" value="${Number(target[m] || 0)}" onchange="updateTarget('${escapeAttr(m)}', this.value)">
        </label>
      `).join("")}
    </div>
  `;
}
window.updateTarget = function(m,v){
  const mode=String(state.selectedMode||PLAN.defaultMode||"4");
  state.weeklyTargetsByMode=state.weeklyTargetsByMode||{};
  state.weeklyTargetsByMode[mode]=state.weeklyTargetsByMode[mode]||{};
  if(!state.weeklyTargetsByMode[mode][state.selectedWeek]) state.weeklyTargetsByMode[mode][state.selectedWeek]={};
  state.weeklyTargetsByMode[mode][state.selectedWeek][m]=Number(v)||0;
  state.weeklyTargets=state.weeklyTargetsByMode[mode];
  saveState();
  renderHome();
  renderProgress();
};
function resetTargetsFromPlan(){
  const mode=String(state.selectedMode||PLAN.defaultMode||"4");
  state.weeklyTargetsByMode=state.weeklyTargetsByMode||{};
  state.weeklyTargetsByMode[mode]=state.weeklyTargetsByMode[mode]||{};
  state.weeklyTargetsByMode[mode][state.selectedWeek]=defaultTargetsFromPlan(state, state.selectedWeek);
  state.weeklyTargets=state.weeklyTargetsByMode[mode];
  saveState();
  renderProgress();
  renderHome();
}

function v10StatusLabel(status){
  return ({
    BELOW_MEV:"🔵 Por debajo del MEV",MEV_ZONE:"🟢 Zona MEV",MAV_ZONE:"🟢 MAV observado",
    HIGH_VOLUME:"🟠 Volumen alto",MRV_WARNING:"🔴 Atención: dolor/recuperación",OVERREACH_RISK:"🔴 Riesgo de exceso compatible",
    INSUFFICIENT_DATA:"⚪ Datos insuficientes"
  })[status] || status;
}
function v10Fmt(n){ return n===null||n===undefined||Number.isNaN(Number(n))?"—":formatNumber(Number(n),1); }
function renderV10VolumeDashboard(){
  const root=$("#v10VolumeDashboard"); if(!root||!window.PrimeOSVolume) return;
  const data=PrimeOSVolume.analyzeWeek(state.selectedWeek,state.settings?.goalMode||"mixed");
  const rows=Object.entries(data).filter(([m,x])=>m!=="cardio" && (x.rawSets>0 || x.targetRange || x.mev!==null)).sort((a,b)=>b[1].weightedSets-a[1].weightedSets);
  if(!rows.length){root.innerHTML="<p class='small-muted'>Registra sesiones para activar el motor de volumen.</p>";return;}
  root.innerHTML=rows.map(([m,x])=>{
    const label=PrimeOSVolume.labels[m]||m;
    const range=x.targetRange ? x.targetRange.map(v10Fmt).join("–") : "sin objetivo";
    const bands=x.mev!==null ? `MEV ${v10Fmt(x.mev)} · MAV ${v10Fmt(x.mavLow)}–${v10Fmt(x.mavHigh)} · MRV obs. ${v10Fmt(x.mrv)}` : "MEV/MAV/MRV: insuficiente";
    return `<div class="v10-volume-row">
      <div class="v10-volume-main"><strong>${escapeHtml(label)}</strong><span class="v10-status">${escapeHtml(v10StatusLabel(x.status))}</span></div>
      <div class="v10-volume-grid">
        <span>Directo <b>${v10Fmt(x.directSets)}</b></span>
        <span>Indirecto <b>${v10Fmt(x.indirectSets)}</b></span>
        <span>Ponderado <b>${v10Fmt(x.weightedSets)}</b></span>
        <span>Rango <b>${escapeHtml(range)}</b></span>
        <span>RIR medio <b>${v10Fmt(x.rirMean)}</b></span>
        <span>Exposiciones <b>${x.exposures}</b></span>
        <span>Rendimiento <b>${escapeHtml(x.performanceTrend)}</b></span>
        <span>Fatiga <b>${escapeHtml(x.fatigueLevel)}</b></span>
        <span>Dolor <b>${v10Fmt(x.pain)}/10</b></span>
        <span>Confianza <b>${escapeHtml(x.confidence)}</b></span>
      </div>
      <div class="small-muted v10-bands">${escapeHtml(bands)}</div>
      <p class="v10-explanation">${escapeHtml(x.explanation)}</p>
    </div>`;
  }).join("");
}
function renderProgress(){
  renderTargetsEditor();
  $("#weeklyMuscleProgress").innerHTML = muscleBarsHTML(state.selectedWeek);
  renderV10VolumeDashboard();
  renderPRs();
  renderFatigue();
  renderExerciseProgress();
}

function renderPRs(){
  const auto = Object.values(state.autoPRs || {}).sort((a, b) => b.e1rm - a.e1rm);
  const autoHtml = auto.length ? auto.map(p => `<div class="progress-row"><strong>${escapeHtml(p.name)}</strong>
      <span class="small-muted">1RM est. <b>${formatNumber(p.e1rm)} kg</b> · ${escapeHtml(formatSetWeight(p))} x ${escapeHtml(p.reps)} · ${escapeHtml(p.date)}</span></div>`).join("")
    : `<p class="small-muted">Aún no hay series con peso y reps para calcular récords.</p>`;
  const manual = Object.entries(state.prs).map(([k,v]) =>
    `<div class="progress-row"><strong>${escapeHtml(k)}</strong><span class="small-muted">${escapeHtml(v)}</span></div>`
  ).join("");
  $("#strengthProgress").innerHTML = `<h4 class="sub-title">Récords detectados</h4>${autoHtml}<h4 class="sub-title">Referencias históricas</h4>${manual}`;
}

function renderFatigue(){
  const painVals = state.sessions.flatMap(s=>s.exercises.flatMap(e=>e.sets.filter(setHasData).map(x=>Number(x.pain||0))));
  const avg = painVals.length ? (painVals.reduce((a,b)=>a+b,0)/painVals.length).toFixed(1) : "0";
  const yellowDays = state.sessions.filter(s=>/precauci[oó]n|amarillo/i.test(String(s.readiness?.status))).length;
  const redDays = state.sessions.filter(s=>/peligro|rojo/i.test(String(s.readiness?.status))).length;
  const alerts = painAlerts();
  $("#fatigueProgress").innerHTML = `
    <div class="progress-row"><strong>Dolor promedio</strong><span class="small-muted">${avg}/10</span></div>
    <div class="progress-row"><strong>Días de precaución</strong><span class="small-muted">${yellowDays}</span></div>
    <div class="progress-row"><strong>Días de peligro</strong><span class="small-muted">${redDays}</span></div>
    ${alerts.length ? alerts.map(a => `<div class="alert-item danger-alert">⚠️ ${escapeHtml(a)}</div>`).join("")
      : `<div class="warning-box">Regla activa: si una zona o ejercicio queda sobre ${PAIN_ALERT_THRESHOLD}/10 por ${PAIN_ALERT_SESSIONS} sesiones seguidas, aparece una alerta aquí y en Inicio.</div>`}
  `;
  renderReadinessChart();
}

function renderReadinessChart(){
  const sessions = sessionsChronological().filter(s => parseNumber(s.readiness?.energy) !== null).slice(-20);
  const empty = $("#readinessChartEmpty");
  if(!sessions.length){
    if(charts.readinessChart){ charts.readinessChart.destroy(); delete charts.readinessChart; }
    empty.textContent = "La tendencia aparece cuando guardas sesiones con el semáforo completo.";
    $("#readinessChart").parentElement.classList.add("hidden");
    return;
  }
  empty.textContent = "";
  $("#readinessChart").parentElement.classList.remove("hidden");
  const maxPain = s => Math.max(...["shoulder","neck","ham"].map(k => parseNumber(s.readiness?.[k]) ?? 0));
  drawChart("readinessChart", {
    type: "line",
    data: {
      labels: sessions.map(s => s.date),
      datasets: [
        {label:"Sueño (1-3)", data: sessions.map(s => SLEEP_SCORE[s.readiness.sleep] ?? null), borderColor: CHART_COLORS.purple, tension: .25},
        {label:"Energía (1-5)", data: sessions.map(s => parseNumber(s.readiness.energy)), borderColor: CHART_COLORS.green, tension: .25},
        {label:"Dolor máx. (0-10)", data: sessions.map(maxPain), borderColor: CHART_COLORS.red, tension: .25}
      ]
    },
    options: { scales: { y: { min: 0, max: 10, grid: { color: CHART_COLORS.grid }, ticks: { color: CHART_COLORS.muted } } } }
  });
}

function renderExerciseProgress(){
  const select = $("#exerciseProgressSelect");
  const catalog = exerciseCatalog();
  const previous = select.value;
  select.innerHTML = catalog.map(c => `<option value="${escapeAttr(c.key)}">${escapeHtml(c.name)}</option>`).join("");
  if(catalog.some(c => c.key === previous)) select.value = previous;
  const summary = $("#exerciseProgressSummary");
  if(!catalog.length){
    summary.textContent = "Registra sesiones para ver el progreso por ejercicio.";
    return;
  }
  const name = catalog.find(c => c.key === select.value)?.name || catalog[0].name;
  const hist = exerciseHistory(name);
  const points = hist.map(h => {
    const best = bestSet(h.sets);
    return {
      label: h.session.date,
      e1rm: best ? estimate1RM(best) : null,
      volume: h.sets.reduce((a, s) => a + setVolumeKg(s), 0) || null
    };
  });
  const bests = points.map(p => p.e1rm).filter(Boolean);
  summary.innerHTML = bests.length
    ? `Mejor 1RM estimado: <b>${formatNumber(Math.max(...bests))} kg</b> · ${hist.length} sesiones registradas`
    : `${hist.length} sesiones registradas (sin peso numérico para calcular 1RM).`;
  drawChart("exerciseChart", {
    type: "line",
    data: {
      labels: points.map(p => p.label),
      datasets: [
        {label:"1RM estimado (kg)", data: points.map(p => p.e1rm && Number(p.e1rm.toFixed(1))), borderColor: CHART_COLORS.primary, backgroundColor:"rgba(47,129,247,.18)", fill: true, tension: .25, yAxisID: "y"},
        {label:"Volumen (kg)", data: points.map(p => p.volume && Math.round(p.volume)), borderColor: CHART_COLORS.yellow, tension: .25, yAxisID: "y1"}
      ]
    },
    options: { scales: { y1: { position: "right", grid: { drawOnChartArea: false }, ticks: { color: CHART_COLORS.muted } } } }
  });
}

/* ---------- Cardio ---------- */

function renderCardio(){
  $("#cardioList").innerHTML = state.cardio.map((c,i)=>`
    <div class="mini-card">
      <div class="form-grid">
        <label>Fecha <input value="${escapeAttr(c.date)}" onchange="updateCardio(${i},'date',this.value)"></label>
        <label>Tipo <input value="${escapeAttr(c.type)}" onchange="updateCardio(${i},'type',this.value)"></label>
        <label>Distancia <input value="${escapeAttr(c.distance)}" onchange="updateCardio(${i},'distance',this.value)"></label>
        <label>Ritmo <input value="${escapeAttr(c.pace || "")}" onchange="updateCardio(${i},'pace',this.value)"></label>
        <label>Tiempo <input value="${escapeAttr(c.time)}" onchange="updateCardio(${i},'time',this.value)"></label>
        <label>Sensación <input value="${escapeAttr(c.feeling || "")}" onchange="updateCardio(${i},'feeling',this.value)"></label>
      </div>
      <div class="actions-row"><button class="danger" onclick="deleteCardio(${i})">Borrar</button></div>
    </div>
  `).join("");
}
window.updateCardio = (i,k,v)=>{state.cardio[i][k]=v;saveState();};
window.deleteCardio = i=>{
  if(!confirm("¿Borrar este registro de cardio?")) return;
  state.cardio.splice(i,1);saveState();renderCardio();
};
function addCardio(){
  state.cardio.push({date:new Date().toLocaleDateString("es-CL"),type:"Zona 2",distance:"",pace:"",time:"",feeling:""});
  saveState();renderCardio();
}

/* ---------- Peso corporal ---------- */

function renderWeight(){
  $("#weightList").innerHTML = state.weightLog.map((n,i)=>`
    <div class="mini-card">
      <div class="form-grid">
        <label>Fecha <input type="date" value="${escapeAttr(n.date || "")}" onchange="updateWeight(${i},'date',this.value)"></label>
        <label>Semana <input value="${escapeAttr(n.week || "")}" onchange="updateWeight(${i},'week',this.value)"></label>
        <label>Peso promedio/kg <input type="number" step="0.1" inputmode="decimal" value="${escapeAttr(n.avg || "")}" onchange="updateWeight(${i},'avg',this.value)"></label>
        <label>Peso mínimo <input type="number" step="0.1" inputmode="decimal" value="${escapeAttr(n.min || "")}" onchange="updateWeight(${i},'min',this.value)"></label>
        <label>Peso máximo <input type="number" step="0.1" inputmode="decimal" value="${escapeAttr(n.max || "")}" onchange="updateWeight(${i},'max',this.value)"></label>
        <label>Cintura/opcional <input value="${escapeAttr(n.waist || "")}" onchange="updateWeight(${i},'waist',this.value)"></label>
        <label class="wide">Notas <input value="${escapeAttr(n.notes || "")}" onchange="updateWeight(${i},'notes',this.value)"></label>
      </div>
      <div class="actions-row"><button class="danger" onclick="deleteWeight(${i})">Borrar</button></div>
    </div>
  `).join("");
  renderWeightChart();
}
window.updateWeight = (i,k,v)=>{
  state.weightLog[i][k]=v;
  saveState();
  renderHome();
  renderWeightChart();
};
window.deleteWeight = i=>{
  if(!confirm("¿Borrar este registro de peso?")) return;
  state.weightLog.splice(i,1);
  saveState();renderWeight();renderHome();
};
function addWeight(){
  state.weightLog.push({date: todayIso(), week:state.selectedWeek, avg:"", min:"", max:"", waist:"", notes:""});
  saveState();renderWeight();
}

function renderWeightChart(){
  const fallback = $("#chartFallback");
  const valid = state.weightLog
    .map((w, idx)=>({...w, idx, n: parseNumber(w.avg)}))
    .filter(w => w.n !== null);

  if(!valid.length){
    if(charts.bodyWeightChart){ charts.bodyWeightChart.destroy(); delete charts.bodyWeightChart; }
    fallback.textContent = "Aún no hay pesos numéricos para graficar.";
    return;
  }

  let labels = [], dataPoints = [];
  if($("#weightChartToggle")?.value === "day"){
    // Registros sin fecha primero (en su orden), luego los fechados en orden cronológico.
    const time = w => { const t = w.date ? new Date(w.date).getTime() : NaN; return Number.isFinite(t) ? t : null; };
    const sorted = valid.sort((a,b)=>{
      const ta = time(a), tb = time(b);
      if(ta === null && tb === null) return a.idx - b.idx;
      if(ta === null) return -1;
      if(tb === null) return 1;
      return ta - tb;
    });
    labels = sorted.map(w => w.date || w.week || `Peso ${w.idx+1}`);
    dataPoints = sorted.map(w => w.n);
  } else {
    const grouped = {};
    valid.forEach(w=>{
      const key = w.week || "Sin semana";
      (grouped[key] = grouped[key] || []).push(w.n);
    });
    labels = Object.keys(grouped);
    dataPoints = labels.map(lbl => Number((grouped[lbl].reduce((a,b)=>a+b,0) / grouped[lbl].length).toFixed(2)));
  }

  drawChart("bodyWeightChart", {
    type: "line",
    data: { labels, datasets: [{
      label: "Peso (kg)", data: dataPoints, borderColor: CHART_COLORS.primary, backgroundColor: "rgba(47,129,247,0.18)",
      borderWidth: 2, pointBackgroundColor: CHART_COLORS.text, fill: true, tension: 0.25
    }]}
  }, "chartFallback");
}

/* ---------- Ajustes ---------- */

function loadSettingsToForm(){
  $("#ownerName").value = state.settings.ownerName || "Martin Reyes";
  $("#goalWeight").value = state.settings.goalWeight || "";
  $("#mainGoal").value = state.settings.mainGoal || "";
  $("#deadliftWeakness").value = state.settings.deadliftWeakness || "";
  $("#sensitiveExercises").value = state.settings.sensitiveExercises || "";
  const last = state.meta.lastBackupAt ? new Date(state.meta.lastBackupAt).toLocaleString("es-CL", {dateStyle:"short", timeStyle:"short"}) : "nunca";
  $("#lastBackupInfo").textContent = `Último respaldo descargado: ${last}.`;
}
function saveSettings(){
  state.settings = {
    ownerName: $("#ownerName").value,
    goalWeight: $("#goalWeight").value,
    mainGoal: $("#mainGoal").value,
    deadliftWeakness: $("#deadliftWeakness").value,
    sensitiveExercises: $("#sensitiveExercises").value
  };
  saveState(); renderAll(); alert("Perfil actualizado ✅");
}
function resetApp(){
  if(confirm("Esto borrará la base de datos local de Prime OS. Exporta un respaldo JSON antes si quieres conservarla. ¿Proceder?")){
    storageRemove("localStorage", STORAGE_KEY);
    clearDraftStorage();
    state = normalizeState(seedState());
    finishStateLoad();
    saveState();
    applySidebarPreference();
    fillSelectors();
    resetTrainingDraft();
    renderAll();
  }
}
