// Dashboard V10.8: reproduce la hoja "Dashboard" de los Excel 3D/4D y compara lo que llevas (sesiones guardadas) con lo que pide el plan.
const DASH_MODE_KEY = "prime_os_dashboard_mode";
const DASH_SOURCES = {"3":"data/v9/source/source_3d_Dashboard.json","4":"data/v9/source/source_4d_Dashboard.json"};
const DASH_DATA = {};
let dashLoading = null, dashBound = false;

// Grupos del Excel ← músculos del motor de volumen. Cada serie suma a un grupo si es músculo principal del ejercicio
// (como cuenta el Excel), ponderada por RIR; sin doble conteo dentro del grupo.
const DASH_GROUPS = [
  {key:"pecho", label:"Pecho", short:"Pecho", match:/^pecho$/i, muscles:["pecho","pecho_superior"]},
  {key:"espalda", label:"Espalda", short:"Espalda", match:/^espalda$/i, muscles:["espalda/dorsal"]},
  {key:"cuad", label:"Cuádriceps", short:"Cuád.", match:/^cu[aá]d/i, muscles:["cuádriceps"]},
  {key:"femgl", label:"Femoral/glúteo", short:"Fem/glút.", match:/^fem/i, muscles:["isquios","glúteo"]},
  {key:"delts", label:"Deltoides", short:"Delts", match:/^delt/i, muscles:["deltoide_lateral","deltoide_posterior"]},
  {key:"brazos", label:"Brazos", short:"Brazos", match:/^brazos$/i, muscles:["bíceps","tríceps","braquial"]},
  {key:"core", label:"Core/cardio", short:"Core/cardio", match:/^core/i, muscles:["core","oblicuos","cardio"]}
];

// Anclajes del Excel → ejercicios registrados (sobre el nombre normalizado).
const DASH_ANCHORS = [
  {match:/inclinado/i, re:/press inclinado/},
  {match:/dominada/i, re:/dominadas? lastrad/},
  {match:/press plano/i, re:/press (plano|banco plano|banca)/},
  {match:/remo/i, re:/remo.*(frontal|hammer)/},
  {match:/prensa/i, re:/prensa|hack/, not:/pies altos/},
  {match:/^rdl/i, re:/\brdl\b|rumano/},
  {match:/hip thrust/i, re:/hip thrust/, not:/rdl o hip/},
  {match:/sumo/i, re:/sumo/},
  {match:/b[uú]lgar/i, re:/bulgar|split squat/},
  {match:/cardio/i, re:/trote|cardio|5k/, cardio:true}
];

function dashMode(){
  const saved = storageGet("localStorage", DASH_MODE_KEY);
  if(saved === "3" || saved === "4") return saved;
  const m = String(state?.selectedMode || "");
  return m === "3" || m === "4" ? m : "3";
}

function loadDashboardData(){
  if(dashLoading) return dashLoading;
  const get = mode => fetch(`${DASH_SOURCES[mode]}?v=${APP_VERSION}`).then(r => { if(!r.ok) throw new Error(r.status); return r.json(); })
    .then(j => { DASH_DATA[mode] = parseDashSheet(j.Dashboard || [], mode); });
  dashLoading = Promise.all(["3","4"].map(get)).catch(err => { console.warn("Dashboard sin datos del Excel", err); dashLoading = null; DASH_DATA.error = true; });
  return dashLoading;
}

/* ---------- Lectura de la hoja del Excel ---------- */

function parseDashSheet(rows, mode){
  const txt = v => v === null || v === undefined ? "" : String(v).trim();
  const out = {mode, title:txt(rows[0]?.[0]), subtitle:"", info:[], weeks:[], groupCols:[], anchors:[], anchorCols:[], semaforo:[], estVolume:[], estCols:[], audit:[], note:""};
  out.subtitle = txt(rows.slice(1,4).find(r => txt(r?.[0]))?.[0]);
  const hIdx = rows.findIndex(r => txt(r?.[0]) === "Semana" && txt(r?.[1]) === "Fase");
  if(hIdx >= 0){
    const head = rows[hIdx].map(txt);
    out.groupCols = DASH_GROUPS.map(g => ({...g, col: head.findIndex(h => g.match.test(h))})).filter(g => g.col >= 0);
    const objCol = head.findIndex(h => /objetivo/i.test(h));
    for(let i = hIdx+1; i < rows.length && typeof rows[i]?.[0] === "number"; i++){
      const r = rows[i];
      out.weeks.push({n:r[0], phase:txt(r[1]), objective:objCol >= 0 ? txt(r[objCol]) : "", ranges:Object.fromEntries(out.groupCols.map(g => [g.key, txt(r[g.col])]))});
    }
  }
  const oIdx = rows.findIndex(r => txt(r?.[0]) === "Objetivo" && txt(r?.[3]) === "Pilares");
  if(oIdx >= 0) out.info = [0,3,6,9].map(c => ({label:txt(rows[oIdx][c]), value:txt(rows[oIdx+1]?.[c])})).filter(x => x.label);
  const aIdx = rows.findIndex(r => txt(r?.[0]) === "Anclaje");
  if(aIdx >= 0){
    const head = rows[aIdx].map(txt);
    const end = head.findIndex((h, i) => i > 0 && !h);
    out.anchorCols = head.slice(0, end > 0 ? end : head.length);
    const semCol = head.indexOf("Semáforo"), volCol = head.indexOf("Semana");
    if(semCol >= 0) out.semaforoCols = head.slice(semCol, semCol+5);
    if(volCol >= 0) out.estCols = head.slice(volCol+1).filter(Boolean);
    for(let i = aIdx+1; i < rows.length; i++){
      const r = rows[i] || [];
      if(!r.some(v => v !== null && v !== "")) break;
      if(txt(r[0])) out.anchors.push(out.anchorCols.map((_, c) => txt(r[c])));
      if(semCol >= 0 && txt(r[semCol])) out.semaforo.push(out.semaforoCols.map((_, c) => txt(r[semCol+c])));
      if(volCol >= 0 && typeof r[volCol] === "number") out.estVolume.push({n:r[volCol], values:out.estCols.map((_, c) => r[volCol+1+c])});
    }
  }
  const cIdx = rows.findIndex(r => txt(r?.[0]) === "Control" && txt(r?.[1]) === "Descripción");
  if(cIdx >= 0){
    for(let i = cIdx+1; i < rows.length && txt(rows[i]?.[0]); i++) out.audit.push([txt(rows[i][0]), txt(rows[i][1]), txt(rows[i][2])]);
    const t = rows.findIndex(r => /auditor/i.test(txt(r?.[0])));
    out.auditTitle = t >= 0 ? txt(rows[t][0]) : "Auditoría";
  }
  const pIdx = rows.findIndex(r => /^PROGRES/i.test(txt(r?.[0])) || /^Progresi[oó]n esperada/i.test(txt(r?.[0])));
  out.anchorTitle = pIdx >= 0 ? txt(rows[pIdx][0]) : "Anclajes";
  out.estTitle = txt(rows[pIdx]?.[7]) || "";
  out.note = txt(rows.find(r => /^Fuentes internas/i.test(txt(r?.[0])))?.[0]);
  return out;
}

/* ---------- Cálculos: lo que llevas ---------- */

function dashSessionMatchesMode(s, mode){ return !s.mode || String(s.mode) === mode; }
function dashWeekSessions(week, mode){ return state.sessions.filter(s => s.week === week && dashSessionMatchesMode(s, mode)); }

// Series efectivas por grupo (ponderadas por RIR y sinergia, igual que el motor V10).
function dashGroupVolume(sessions){
  const out = Object.fromEntries(DASH_GROUPS.map(g => [g.key, 0]));
  sessions.forEach(s => v10SetRows(s).forEach(row => {
    const cls = row.classification;
    if(row.warmup || !cls.countsAsVolume) return;
    DASH_GROUPS.forEach(g => {
      const w = Math.max(0, ...g.muscles.filter(m => cls.primaryMuscles?.includes(m)).map(m => Number(cls.volumeWeights?.[m] || 0)));
      if(w > 0) out[g.key] += w * row.rirQuality.factor;
    });
  }));
  return out;
}

function dashNums(text){ return String(text ?? "").replace(/(\d),(\d)/g, "$1.$2").match(/\d+(?:\.\d+)?/g)?.map(Number) || []; }
function dashRangeMid(text){ const n = dashNums(text); return n.length >= 2 ? (n[0]+n[1])/2 : n.length ? n[0] : null; }

// Rango requerido; los pivots en % se calculan sobre el punto medio del plan de la semana referida.
function dashRequired(sheet, weekRow, groupKey){
  const raw = weekRow.ranges[groupKey] || "";
  if(/%/.test(raw)){
    const pct = dashNums(raw.replace(/\bS(?:em(?:ana)?)?\s*\d+/i, ""));
    const rowRef = Object.values(weekRow.ranges).map(v => String(v).match(/\bS(?:em(?:ana)?)?\s*(\d+)/i)?.[1]).find(Boolean);
    const ref = Number(rowRef || weekRow.n - 1);
    const refRow = sheet.weeks.find(w => w.n === ref);
    const mid = refRow ? dashRangeMid(refRow.ranges[groupKey]) : null;
    if(mid && pct.length) return {text:raw, lo:mid*pct[0]/100, hi:mid*(pct[1] ?? pct[0])/100, derived:true, ref};
    return {text:raw, lo:null, hi:null};
  }
  const n = dashNums(raw);
  if(n.length >= 2) return {text:raw, lo:n[0], hi:n[1]};
  if(n.length === 1) return {text:raw, lo:n[0], hi:n[0]};
  return {text:raw, lo:null, hi:null};
}

function dashReadinessColor(s){
  const t = stripAccents(String(s.readiness?.status || "")).toLowerCase();
  if(/optimo|verde|green/.test(t)) return "green";
  if(/peligro|rojo|red/.test(t)) return "red";
  if(/precaucion|amarillo|yellow/.test(t)) return "yellow";
  return null;
}

function dashWeekStats(week, mode, plannedDays){
  const sessions = dashWeekSessions(week, mode);
  const done = plannedDays.filter(d => dashDayDone(week, d, mode));
  const colors = sessions.map(dashReadinessColor);
  const pains = sessions.flatMap(s => [s.readiness?.shoulder, s.readiness?.neck, s.readiness?.ham, ...(s.exercises || []).flatMap(e => (e.sets || []).filter(setHasData).map(x => x.pain))])
    .map(parseNumber).filter(v => v !== null);
  const energy = sessions.map(s => parseNumber(s.readiness?.energy)).filter(v => v !== null);
  return {
    sessions: sessions.length,
    adherence: plannedDays.length ? done.length / plannedDays.length : null,
    green: colors.filter(c => c === "green").length,
    red: colors.filter(c => c === "red").length,
    painMax: pains.length ? Math.max(...pains) : null,
    energy: energy.length ? energy.reduce((a, b) => a + b, 0) / energy.length : null
  };
}

function dashPlannedDays(week, mode){
  const routine = state.routinesByMode?.[mode]?.[week] || PLAN.routineByMode?.[mode]?.[week] || {};
  const days = PLAN.modeDays?.[mode] || [];
  const planned = days.filter(d => Array.isArray(routine[d]) && routine[d].length);
  const rank = d => { const i = WEEKDAYS.indexOf(weekdayOf(d)); return i < 0 ? 9 : i; };
  return (planned.length ? planned : days).slice().sort((a, b) => rank(a) - rank(b));
}

function dashDayDone(week, day, mode){
  return state.sessions.some(s => s.week === week && dashSessionMatchesMode(s, mode) &&
    (s.session === day || (!s.session && sessionLabel(s.day) === sessionLabel(day))));
}

function dashAnchorActual(anchorName){
  const def = DASH_ANCHORS.find(a => a.match.test(anchorName));
  if(!def) return null;
  const hits = [];
  sessionsChronological().forEach(s => (s.exercises || []).forEach(e => {
    const key = exerciseKeyBase(e.name);
    if(!def.re.test(key) || (def.not && def.not.test(key))) return;
    const sets = (e.sets || []).filter(setHasData);
    if(sets.length) hits.push({session:s, exercise:e, sets, best:bestSet(sets)});
  }));
  if(!hits.length) return {cardio:def.cardio, count:0};
  if(def.cardio) return {cardio:true, count:hits.length, last:hits[hits.length-1]};
  let top = null, topKg = null, heavy = null;
  hits.forEach(h => {
    const e1 = h.best ? estimate1RM(h.best) : null;
    if(e1 !== null && (!top || e1 > top.e1)) top = {...h, e1};
    h.sets.forEach(x => { const kg = toKg(x); if(kg !== null && (topKg === null || kg > topKg)){ topKg = kg; heavy = {...h, set:x}; } });
  });
  const names = [...new Set(hits.map(h => h.exercise.name))];
  return {count:hits.length, top, topKg, heavy, last:hits[hits.length-1], names};
}

/* ---------- Render ---------- */

function renderDashboard(force){
  const root = $("#dashboardRoot");
  if(!root || !state) return;
  if(!force && currentView() !== "dashboard") return;
  if(!dashBound){
    dashBound = true;
    root.addEventListener("click", e => {
      const b = e.target.closest("[data-dash-mode]");
      if(!b) return;
      storageSet("localStorage", DASH_MODE_KEY, b.dataset.dashMode);
      renderDashboard(true);
    });
  }
  const mode = dashMode();
  if(!DASH_DATA[mode]){
    if(DASH_DATA.error && !dashLoading){ root.innerHTML = `<div class="card"><p class="small-muted">No pude cargar los datos del Excel. Revisa tu conexión y recarga.</p><button type="button" class="ghost" data-dash-mode="${mode}">Reintentar</button></div>`; DASH_DATA.error = false; return; }
    root.innerHTML = `<p class="small-muted">Cargando dashboard…</p>`;
    loadDashboardData().then(() => { if(DASH_DATA[mode]) renderDashboard(true); });
    return;
  }
  const sheet = DASH_DATA[mode];
  const weeks = state.weeks.length ? state.weeks : PLAN.weeks;
  const weekName = n => `Semana ${n}`;
  const current = state.selectedWeek;
  const cov = weeks.map(w => { const days = dashPlannedDays(w, mode); return {week:w, days, done:days.filter(d => dashDayDone(w, d, mode))}; });
  const plannedTotal = cov.reduce((a, c) => a + c.days.length, 0), doneTotal = cov.reduce((a, c) => a + c.done.length, 0);
  const modeSessions = state.sessions.filter(s => dashSessionMatchesMode(s, mode) && weeks.includes(s.week)).length;
  const scroll = html => `<div class="dash-scroll">${html}</div>`;

  const header = `
    <div class="card dash-head-card">
      <div class="dash-mode-switch" role="tablist" aria-label="Dashboard del Excel">
        ${["3","4"].map(m => `<button type="button" role="tab" class="dash-mode-btn${m===mode?" active":""}" aria-selected="${m===mode}" data-dash-mode="${m}">${m} días</button>`).join("")}
      </div>
      <span class="eyebrow">Excel ${mode} días · Dashboard</span>
      <h3 class="dash-title">${escapeHtml(sheet.title)}</h3>
      <p class="small-muted">${escapeHtml(sheet.subtitle)}</p>
      ${sheet.info.length ? `<div class="dash-info">${sheet.info.map(i => `<div><span class="eyebrow">${escapeHtml(i.label)}</span><strong>${escapeHtml(i.value)}</strong></div>`).join("")}</div>` : ""}
      <div class="dash-kpis">
        <div><strong>${escapeHtml(current)}</strong><span>Semana actual</span></div>
        <div><strong>${doneTotal}/${plannedTotal}</strong><span>Días hechos</span></div>
        <div><strong>${modeSessions}</strong><span>Sesiones ${mode}D</span></div>
      </div>
    </div>`;

  const is4 = mode === "4";
  const groups = sheet.groupCols;
  const weekRows = sheet.weeks.map(wr => {
    const w = weekName(wr.n), sessions = dashWeekSessions(w, mode), vol = dashGroupVolume(sessions);
    const stats = is4 ? dashWeekStats(w, mode, dashPlannedDays(w, mode)) : null;
    const cells = groups.map(g => {
      const req = dashRequired(sheet, wr, g.key), act = vol[g.key];
      let cls = "none";
      if(sessions.length && req.lo !== null) cls = act < req.lo - 0.05 ? "low" : act > req.hi + 0.05 ? "high" : "ok";
      const derived = req.derived ? `<small>≈ ${formatNumber(req.lo)}–${formatNumber(req.hi)}</small>` : "";
      return `<td class="dash-cell ${cls}" data-group="${g.key}"><span class="dash-req">${escapeHtml(req.text || "—")}</span>${derived}<b class="dash-act">${sessions.length ? formatNumber(act) : "—"}</b></td>`;
    }).join("");
    const extra = is4
      ? `<td>${stats.adherence === null ? "—" : Math.round(stats.adherence*100)+"%"}</td><td class="dash-num green-text">${stats.green || (stats.sessions ? 0 : "—")}</td><td class="dash-num red-text">${stats.red || (stats.sessions ? 0 : "—")}</td><td class="dash-num">${stats.painMax === null ? "—" : formatNumber(stats.painMax, 0)+"/10"}</td><td class="dash-num">${stats.energy === null ? "—" : formatNumber(stats.energy)+"/5"}</td>`
      : `<td class="dash-obj">${escapeHtml(wr.objective)}</td>`;
    return `<tr class="${w === current ? "current" : ""}${/pivot/i.test(wr.phase) ? " pivot" : ""}" data-week="${wr.n}"><th scope="row">S${wr.n}${w === current ? `<em>actual</em>` : ""}</th><td class="dash-phase">${escapeHtml(wr.phase)}</td>${cells}${extra}</tr>`;
  }).join("");
  const weekTable = `
    <div class="card">
      <div class="card-head"><div>
        <span class="eyebrow">${is4 ? "Resumen inteligente por semana" : "Semana a semana"}</span>
        <h3>Requerido vs lo que llevas</h3>
        <p class="small-muted">Arriba el rango del Excel (series/semana); abajo tus series efectivas directas registradas (ponderadas por RIR, motor V10). Los pivots en % se calculan sobre el punto medio de la semana referida.</p>
      </div></div>
      <div class="dash-legend"><span class="dash-chip ok">En rango</span><span class="dash-chip low">Bajo</span><span class="dash-chip high">Sobre</span><span class="dash-chip none">Sin registro</span></div>
      ${scroll(`<table class="dash-table dash-weeks"><thead><tr><th>Sem</th><th>Fase</th>${groups.map(g => `<th>${escapeHtml(g.short)}</th>`).join("")}${is4 ? "<th>Adherencia</th><th>Verdes</th><th>Rojos</th><th>Dolor máx</th><th>Energía</th>" : "<th>Objetivo clave</th>"}</tr></thead><tbody>${weekRows}</tbody></table>`)}
    </div>`;

  const anchorTargetCol = () => {
    if(!is4) return 2;
    const n = Number(String(current).match(/\d+/)?.[0] || 1);
    return n <= 7 ? 2 : n <= 11 ? 3 : 4;
  };
  const tCol = anchorTargetCol();
  const anchorCards = sheet.anchors.map(a => {
    const act = dashAnchorActual(a[0]);
    const plan = sheet.anchorCols.slice(1).map((h, i) => a[i+1] ? `<div class="${i+1 === tCol ? "target" : ""}"><dt>${escapeHtml(h)}</dt><dd>${escapeHtml(a[i+1])}</dd></div>` : "").join("");
    let actual = `<p class="dash-empty">sin registros</p>`;
    if(act?.cardio && act.count) actual = `<p><b>${act.count}</b> registro(s) de cardio en sesiones · último: ${escapeHtml(act.last.session.week)}</p>`;
    else if(act && act.count){
      const baseKg = dashNums(a[1])[0] ?? null, targetKg = dashNums(a[tCol])[0] ?? null;
      const topSet = act.top?.best || act.heavy?.set;
      const lastBest = act.last.best;
      const vsBase = baseKg && act.topKg ? (act.topKg - baseKg) / baseKg * 100 : null;
      const vsTarget = targetKg && act.topKg ? Math.min(150, act.topKg / targetKg * 100) : null;
      actual = `
        <p>Mejor serie: <b>${topSet ? `${escapeHtml(formatSetWeight(topSet))} × ${escapeHtml(topSet.repsDone || "—")}` : "—"}</b>${act.top ? ` · RM est. <b>${formatNumber(act.top.e1)} kg</b>` : ""}</p>
        <p class="small-muted">Última: ${lastBest ? `${escapeHtml(formatSetWeight(lastBest))} × ${escapeHtml(lastBest.repsDone || "—")}${lastBest.rir ? ` (RIR ${escapeHtml(lastBest.rir)})` : ""}` : "—"} · ${escapeHtml(act.last.session.week || "")} · ${act.count} registro(s)</p>
        <div class="dash-anchor-meta">
          ${vsBase !== null ? `<span class="pill">${vsBase >= 0 ? "+" : ""}${formatNumber(vsBase, 0)}% vs base</span>` : ""}
          ${vsTarget !== null ? `<span class="pill ${vsTarget >= 100 ? "dash-pill-ok" : "alt"}">${formatNumber(Math.min(vsTarget, 100), 0)}% de la meta (${formatNumber(targetKg)} kg)</span>` : ""}
        </div>
        ${vsTarget !== null ? `<div class="dash-bar"><span style="width:${Math.min(100, vsTarget).toFixed(0)}%"></span></div>` : ""}`;
    }
    return `<article class="dash-anchor"><h4>${escapeHtml(a[0])}</h4><div class="dash-anchor-grid"><dl class="dash-plan">${plan}</dl><div class="dash-actual"><span class="eyebrow">Lo que llevas</span>${actual}</div></div></article>`;
  }).join("");
  const anchors = `
    <div class="card">
      <div class="card-head"><div>
        <span class="eyebrow">Anclajes</span>
        <h3>${escapeHtml(sheet.anchorTitle)}</h3>
        <p class="small-muted">Plan del Excel vs tu mejor serie registrada (todas las sesiones). ${is4 ? "La meta resaltada es la vigente para tu semana actual." : "La meta es el esperado a Semana 12."}</p>
      </div></div>
      <div class="dash-anchors">${anchorCards || `<p class="small-muted">Sin anclajes en el Excel.</p>`}</div>
    </div>`;

  let est = "";
  if(is4 && sheet.estVolume.length){
    const map = ["pecho","espalda","cuad","femgl","delts","brazos"];
    est = `
    <div class="card">
      <div class="card-head"><div>
        <span class="eyebrow">Plan estimado</span>
        <h3>${escapeHtml(sheet.estTitle || "Volumen estimado por grupo")}</h3>
        <p class="small-muted">Estimado del Excel / tus series efectivas de esa semana.</p>
      </div></div>
      ${scroll(`<table class="dash-table dash-est"><thead><tr><th>Sem</th>${sheet.estCols.map(c => `<th>${escapeHtml(c)}</th>`).join("")}</tr></thead><tbody>${sheet.estVolume.map(r => {
        const w = weekName(r.n), ss = dashWeekSessions(w, mode), vol = dashGroupVolume(ss);
        return `<tr class="${w === current ? "current" : ""}"><th scope="row">S${r.n}</th>${r.values.map((v, i) => {
          const act = vol[map[i]], cls = !ss.length ? "none" : act >= Number(v) - 0.05 ? "ok" : "low";
          return `<td class="dash-cell ${cls}"><span class="dash-req">${formatNumber(Number(v))}</span><b class="dash-act">${ss.length ? formatNumber(act) : "—"}</b></td>`;
        }).join("")}</tr>`;
      }).join("")}</tbody></table>`)}
    </div>`;
  }

  let guide = "";
  if(sheet.semaforo.length){
    const counts = {green:0, yellow:0, red:0};
    state.sessions.filter(s => dashSessionMatchesMode(s, mode)).forEach(s => { const c = dashReadinessColor(s); if(c) counts[c]++; });
    const colorOf = t => /verde/i.test(t) ? "green" : /amar/i.test(t) ? "yellow" : "red";
    guide = `
    <div class="card">
      <div class="card-head"><div>
        <span class="eyebrow">Guía</span>
        <h3>Semáforo</h3>
        <p class="small-muted">Tus sesiones ${mode}D: <b class="green-text">${counts.green} verdes</b> · <b class="yellow-text">${counts.yellow} amarillas</b> · <b class="red-text">${counts.red} rojas</b></p>
      </div></div>
      <div class="dash-sema">${sheet.semaforo.map(r => `<article class="dash-sema-item ${colorOf(r[0])}"><h4><span class="badge ${colorOf(r[0])}">${escapeHtml(r[0])}</span></h4><dl>${sheet.semaforoCols.slice(1).map((h, i) => `<div><dt>${escapeHtml(h)}</dt><dd>${escapeHtml(r[i+1])}</dd></div>`).join("")}</dl></article>`).join("")}</div>
    </div>`;
  }
  if(sheet.audit.length){
    guide += `
    <div class="card">
      <div class="card-head"><div>
        <span class="eyebrow">Guía</span>
        <h3>${escapeHtml(sheet.auditTitle)}</h3>
      </div></div>
      <ul class="dash-audit">${sheet.audit.map(r => `<li><span class="pill ${/ok/i.test(r[2]) ? "dash-pill-ok" : "alt"}">${escapeHtml(r[2] || "—")}</span><div><b>${escapeHtml(r[0])}</b><span>${escapeHtml(r[1])}</span></div></li>`).join("")}</ul>
    </div>`;
  }

  const coverage = `
    <div class="card">
      <div class="card-head"><div>
        <span class="eyebrow">Cobertura del plan · ${mode} días</span>
        <h3>Hecho vs requerido</h3>
        <p class="small-muted">Días planificados de cada semana y si ya tienen una sesión guardada (${doneTotal} de ${plannedTotal}).</p>
      </div></div>
      <div class="dash-coverage">${cov.map(c => `
        <div class="dash-cov-row${c.week === current ? " current" : ""}" data-week="${escapeAttr(c.week)}">
          <div class="dash-cov-week"><b>${escapeHtml(c.week)}</b><span>${c.done.length}/${c.days.length}</span></div>
          <div class="dash-cov-days">${c.days.map(d => { const ok = c.done.includes(d); return `<span class="dash-day ${ok ? "done" : "pending"}" title="${escapeAttr(d)}">${ok ? "✓" : "○"} ${escapeHtml(sessionLabel(d).replace(" · Excel", ""))}</span>`; }).join("")}</div>
        </div>`).join("")}
      </div>
    </div>`;

  const note = sheet.note ? `<p class="small-muted dash-note">${escapeHtml(sheet.note)}</p>` : "";
  root.innerHTML = header + weekTable + coverage + anchors + est + guide + note;
}
