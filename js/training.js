// Registrar: borrador de la sesión (se guarda solo en el equipo hasta presionar "Guardar sesión") y guardado.
let trainingDraft = [];

function blankSet(i){
  return {set:i, weight:"", repsDone:"", rir:"", feeling:"", rest:"", pain:"0", done:false};
}

function selectedRoutine(){ return state.routine[state.selectedWeek]?.[state.selectedDay] || []; }

function resetTrainingDraft(){
  trainingDraft = selectedRoutine().map(e => ({
    ...clone(e),
    actualSets: Number(e.sets)||3,
    isAdded:false,
    isAlternative:false,
    setsData: Array.from({length:Number(e.sets)||3}, (_,i)=>blankSet(i+1)),
    noteDraft:"",
    secondaryText:""
  }));
}

// Recupera el registro sin guardar (si se cerró la app o se recargó la página).
function restoreDraft(){
  const d = loadDraftFromStorage();
  if(d) d.day = String(d.day || "").replace(/^Complemento - /, "");
  if(!d || !state.weeks.includes(d.week) || !state.days.includes(d.day)) return false;
  state.selectedWeek = d.week;
  state.selectedDay = d.day;
  if(WEEKDAYS.includes(d.weekday)) state.selectedWeekday = d.weekday;
  trainingDraft = d.draft;
  const notes = $("#sessionNotes");
  if(notes) notes.value = d.notes || "";
  return true;
}

function ensureSetsLength(ex){
  const n = Number(ex.actualSets)||1;
  if(!Array.isArray(ex.setsData)) ex.setsData = [];
  while(ex.setsData.length < n) ex.setsData.push(blankSet(ex.setsData.length+1));
  if(ex.setsData.length > n) ex.setsData = ex.setsData.slice(0,n);
  ex.setsData.forEach((s,i)=>s.set=i+1);
}

function collectDraftInputs(){
  if(!document.getElementById("trainingForm")) return;
  trainingDraft.forEach((e,ei)=>{
    const read = field => document.querySelector(`[data-ei="${ei}"][data-field="${field}"]:not([data-si])`);
    const map = {name:"name", muscle:"muscle", reps:"reps", target:"target", load:"load", note:"noteDraft", secondary:"secondaryText"};
    Object.entries(map).forEach(([field, key]) => {
      const el = read(field);
      if(el) e[key] = field === "muscle" ? normalizeMuscle(el.value) : el.value;
    });

    ensureSetsLength(e);
    e.setsData.forEach((s,si)=>{
      ["weight","repsDone","rir","feeling","rest","pain","done"].forEach(field=>{
        const el = document.querySelector(`[data-ei="${ei}"][data-si="${si}"][data-field="${field}"]`);
        if(el) s[field] = field === "done" ? el.checked : el.value;
      });
    });
  });
}

function draftHasData(){
  if(($("#sessionNotes")?.value || "").trim()) return true;
  return trainingDraft.some(e => (e.noteDraft || "").trim() || e.isAdded ||
    (e.setsData || []).some(s => s.done || ["weight","repsDone","rir","feeling","rest"].some(k => String(s[k] || "").trim()) || (s.pain && s.pain !== "0")));
}

function confirmDiscardDraft(){
  if(!draftHasData()) return true;
  if(!confirm("Tienes datos sin guardar en Registrar. Si cambias de semana o día se perderán. ¿Continuar?")) return false;
  $("#sessionNotes").value = "";
  clearDraftStorage();
  return true;
}

const autosaveDraft = debounce(() => { collectDraftInputs(); saveDraftToStorage(); }, 400);

function bindTrainingForm(){
  $("#trainingForm").addEventListener("input", autosaveDraft);
  $("#trainingForm").addEventListener("change", autosaveDraft);
  $("#sessionNotes").addEventListener("input", autosaveDraft);
  // Guardado inmediato al cerrar la app, cambiar de app o bloquear el celular.
  const flushDraft = () => { collectDraftInputs(); saveDraftToStorage(); };
  window.addEventListener("pagehide", flushDraft);
  document.addEventListener("visibilitychange", () => { if(document.visibilityState === "hidden") flushDraft(); });
}

function renderTraining(){
  $("#trainTitle").textContent = `${state.selectedWeekday} · ${sessionLabel(state.selectedDay)} · ${state.selectedWeek}`;
  $("#trainingForm").innerHTML = trainingDraft.map((e,ei)=> renderExerciseRegister(e,ei)).join("");
}

function renderExerciseRegister(e, ei){
  ensureSetsLength(e);
  const prev = findPreviousExercise(e.name);
  const compare = prev && !e.isAdded ? `<div class="compare-box">Mejor serie anterior: ${escapeHtml(formatBestSet(prev))}.</div>` :
    `<div class="warning-box">${e.isAdded ? "Agregado: elige músculo/tipo para que sus series sumen al progreso semanal." : "Sin registro previo para este ejercicio."}</div>`;

  const rows = e.setsData.map((s,si)=>`
    <tr>
      <td style="font-weight:bold; color:var(--primary);">${si+1}</td>
      <td><input data-ei="${ei}" data-si="${si}" data-field="weight" placeholder="kg" value="${escapeAttr(s.weight)}"></td>
      <td><input data-ei="${ei}" data-si="${si}" data-field="repsDone" placeholder="reps" value="${escapeAttr(s.repsDone)}"></td>
      <td><input data-ei="${ei}" data-si="${si}" data-field="rir" placeholder="RIR/RPE" value="${escapeAttr(s.rir)}"></td>
      <td><input data-ei="${ei}" data-si="${si}" data-field="feeling" placeholder="sensación" value="${escapeAttr(s.feeling)}"></td>
      <td><input data-ei="${ei}" data-si="${si}" data-field="rest" placeholder="min" value="${escapeAttr(s.rest)}"></td>
      <td><input data-ei="${ei}" data-si="${si}" data-field="pain" type="number" min="0" max="10" value="${escapeAttr(s.pain)}"></td>
      <td class="check-cell"><input data-ei="${ei}" data-si="${si}" data-field="done" type="checkbox" ${s.done?"checked":""}>OK</td>
    </tr>
  `).join("");

  return `
    <div class="exercise-card ${e.isAdded ? "add-box":"main-box"}">
      <div class="exercise-head">
        <div>
          ${e.isAdded ? '<span class="pill alt">Agregado</span>' : '<span class="owner-chip">Planificado</span>'}
          <input class="inline-title-input" data-ei="${ei}" data-field="name" value="${escapeAttr(e.name)}" onchange="updateDraftField(${ei}, 'name', this.value)">
          <div class="exercise-meta">
            <span class="pill">Obj: ${escapeHtml(e.reps || "abierto")}</span>
            <span class="pill">RIR/RPE: ${escapeHtml(e.target || "abierto")}</span>
            <span class="pill">Carga: ${escapeHtml(e.load || "abierta")}</span>
            <span class="pill">Músculo: ${escapeHtml(e.muscle || "general")}</span>
          </div>
        </div>
        <div class="stack-actions">
          <select onchange="changeActualSets(${ei}, this.value)">
            ${[1,2,3,4,5,6,7,8,9,10].map(n=>`<option value="${n}" ${Number(e.actualSets)===n?"selected":""}>${n} series</option>`).join("")}
          </select>
          <button class="ghost" onclick="removeDraftExercise(${ei})">Quitar</button>
        </div>
      </div>

      <div class="form-grid">
        <label>Tipo / músculo
          <select data-ei="${ei}" data-field="muscle" onchange="updateDraftField(${ei}, 'muscle', this.value)">${muscleOptions(e.muscle)}</select>
        </label>
        <label>Reps objetivo
          <input data-ei="${ei}" data-field="reps" value="${escapeAttr(e.reps || "")}" onchange="updateDraftField(${ei}, 'reps', this.value)">
        </label>
        <label>RIR/RPE objetivo
          <input data-ei="${ei}" data-field="target" value="${escapeAttr(e.target || "")}" onchange="updateDraftField(${ei}, 'target', this.value)">
        </label>
        <label>Carga sugerida
          <input data-ei="${ei}" data-field="load" value="${escapeAttr(e.load || "")}" onchange="updateDraftField(${ei}, 'load', this.value)">
        </label>
        ${v10AddedFields(e,ei)}
      </div>

      ${compare}

      <table class="set-table">
        <thead><tr><th>Serie</th><th>Peso</th><th>Reps</th><th>RIR/RPE</th><th>Sensación</th><th>Descanso</th><th>Dolor</th><th>Check</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>

      <label>Observaciones del ejercicio
        <input data-ei="${ei}" data-field="note" value="${escapeAttr(e.noteDraft || "")}" placeholder="Técnica, molestia, bloqueo, velocidad, etc.">
      </label>
    </div>`;
}


function v10AddedFields(e,ei){
  if(!e.isAdded) return "";
  return '<label class="wide">Sinergias personalizadas (ej: bíceps:0.5, deltoide_anterior:0.25) <input data-ei="'+ei+'" data-field="secondary" value="'+escapeAttr(e.secondaryText||"")+'" placeholder="músculo:peso, músculo:peso"></label>';
}
function formatBestSet(prev){
  const best = bestSet(prev.sets);
  if(!best) return "sin series registradas";
  return `${formatSetWeight(best)} x ${best.repsDone || "—"} · ${best.rir || "sin RIR/RPE"} · dolor ${best.pain ?? "—"}/10`;
}

window.updateDraftField = function(i,k,v){
  collectDraftInputs();
  trainingDraft[i][k] = k === "muscle" ? normalizeMuscle(v) : v;
  if(k==="name" && typeof v10AddExerciseMeta==="function"){
    const enriched=v10AddExerciseMeta(trainingDraft[i]);
    Object.assign(trainingDraft[i],enriched);
  }
  saveDraftToStorage();
};
window.changeActualSets = function(i,v){
  collectDraftInputs();
  const lost = trainingDraft[i].setsData.slice(Number(v)).filter(s => setHasData(s)).length;
  if(lost && !confirm(`Vas a quitar ${lost} serie(s) con datos. ¿Continuar?`)){ renderTraining(); return; }
  trainingDraft[i].actualSets = Number(v);
  ensureSetsLength(trainingDraft[i]);
  renderTraining();
  saveDraftToStorage();
};
window.removeDraftExercise = function(i){
  collectDraftInputs();
  trainingDraft.splice(i,1);
  renderTraining();
  saveDraftToStorage();
};

function addAddedExercise(){
  collectDraftInputs();
  trainingDraft.unshift({
    name:"Ejercicio agregado",
    sets:3,
    actualSets:3,
    reps:"",
    load:"",
    target:"",
    muscle:"pecho",
    note:"Ejercicio agregado porque cambié o sumé algo al plan.",
    isAdded:true,
    isAlternative:true,
    setsData:[blankSet(1), blankSet(2), blankSet(3)],
    noteDraft:""
  });
  renderTraining();
  saveDraftToStorage();
  $("#trainingForm .exercise-card")?.scrollIntoView({behavior: "smooth", block: "start"});
}

function saveSession(){
  collectDraftInputs();
  const exercises = trainingDraft.map(e=>{
    ensureSetsLength(e);
    const enriched=typeof v10AddExerciseMeta==="function" ? v10AddExerciseMeta({
      name:e.name,muscle:normalizeMuscle(e.muscle),secondaryMuscles:Array.isArray(e.secondaryMuscles)?e.secondaryMuscles:[]
    }) : {};
    return {
      name:e.name,
      muscle:normalizeMuscle(e.muscle),
      sourceMuscle:e.sourceMuscle || e.muscle || "",
      normalizedMuscle:enriched.normalizedMuscle || normalizeMuscle(e.muscle),
      primaryMuscles:enriched.primaryMuscles || [normalizeMuscle(e.muscle)],
      secondaryMuscles:enriched.secondaryMuscles || e.secondaryMuscles || [],
      volumeWeights:enriched.volumeWeights || {[normalizeMuscle(e.muscle)]:1},
      v10Meta:enriched.v10Meta || null,
      target:e.target || "",
      actualSets:e.actualSets,
      isAdded:Boolean(e.isAdded),
      isAlternative:Boolean(e.isAdded),
      sets:e.setsData.map((s,i) => normalizeSet({...s, set:i+1}, i)),
      note:e.noteDraft || ""
    };
  });

  const session = {
    id: Date.now(),
    date: new Date().toLocaleString("es-CL", {dateStyle:"short", timeStyle:"short"}),
    createdAt: new Date().toISOString(),
    week: state.selectedWeek,
    day: `${state.selectedWeekday} - ${sessionLabel(state.selectedDay)}`,
    weekday: state.selectedWeekday,
    session: state.selectedDay,
    readiness: {
      sleep: $("#sleepInput").value,
      energy: $("#energyInput").value,
      shoulder: $("#shoulderPainInput").value,
      neck: $("#neckPainInput").value,
      ham: $("#hamPainInput").value,
      motivation: $("#motivationInput").value,
      status: $("#readinessBadge").textContent
    },
    exercises,
    notes: $("#sessionNotes").value
  };

  const prs = detectPRs(session);
  state.sessions.push(session);
  prs.forEach(pr => { state.autoPRs[pr.key] = pr; });
  $("#sessionNotes").value = "";
  saveState();
  clearDraftStorage();

  const prText = prs.length
    ? "\n\n🏆 Nuevo PR:\n" + prs.map(p => `• ${p.name}: ${formatSetWeight(p)} x ${p.reps} → 1RM est. ${formatNumber(p.e1rm)} kg`).join("\n")
    : "";
  alert("Sesión guardada en Prime OS ✅" + prText);
  resetTrainingDraft();
  renderAll();
}
