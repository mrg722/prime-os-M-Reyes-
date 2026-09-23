// Arranque: carga del plan y estado, navegación, pantalla inicial, menú móvil y service worker.
document.addEventListener("DOMContentLoaded", setup);

async function setup(){
  try {
    await loadPlan();
  } catch(err){
    console.error(err);
    document.body.innerHTML = `<div class="fatal-error"><h1>Prime OS</h1><p>No pude cargar el plan de entrenamiento (data/plan.json). Revisa tu conexión y recarga la página.</p></div>`;
    return;
  }
  state = loadState();
  finishStateLoad();

  const restored = restoreDraft();
  fillSelectors();
  bindNav();
  bindInputs();
  bindTrainingForm();
  bindTimer();
  bindLaunchScreen();
  bindMobileDrawer();
  applySidebarPreference();
  applyBackgroundForView("inicio");
  if(!restored) resetTrainingDraft();
  renderAll();
  refreshTopMeta("inicio");
  setUpdateStatus("Versión instalada: "+APP_VERSION);
  if(restored) toast("Recuperé tu registro sin guardar. Sigue donde quedaste en Registrar.", "info", 6000);
  registerServiceWorker();
  checkRemoteVersion();
}

function fillSelectors(){
  const mode = $("#modeSelect"), week = $("#weekSelect");
  if(mode){
    mode.value = String(state.selectedMode || PLAN.defaultMode || "4");
  }
  week.innerHTML = state.weeks.map(w=>`<option ${w===state.selectedWeek?"selected":""}>${escapeHtml(w)}</option>`).join("");
  $("#weekdaySelect").innerHTML = WEEKDAYS.map(w => `<option ${w===state.selectedWeekday?"selected":""}>${w}</option>`).join("");
  $("#daySelect").innerHTML = sortedSessions(state.days).map(d =>
    `<option value="${escapeAttr(d)}" ${d===state.selectedDay?"selected":""}>${escapeHtml(sessionLabel(d))}</option>`).join("");
}

function bindNav(){
  $$(".nav-btn").forEach(btn => btn.addEventListener("click", () => switchView(btn.dataset.view)));
  $$("[data-go]").forEach(btn => btn.addEventListener("click", () => switchView(btn.dataset.go)));
}

function bindInputs(){
  $("#menuBtn").addEventListener("click",()=>{
    const sidebar = $("#sidebar");
    sidebar.classList.toggle("open");
    document.body.classList.toggle("mobile-menu-open", sidebar.classList.contains("open"));
  });
  $("#sidebarCompactBtn").addEventListener("click", toggleSidebarCompact);
  $("#sidebarTopToggle").addEventListener("click", toggleSidebarCompact);
  $("#modeSelect")?.addEventListener("change", e => {
    collectDraftInputs();
    if(!confirmDiscardDraft()){ e.target.value = state.selectedMode; return; }
    const nextMode = String(e.target.value);
    state.routinesByMode = state.routinesByMode || {};
    if(String(state.selectedMode)==="2" && typeof applyAdaptiveFullBodySelection==="function"){
      state.routinesByMode["2"][state.selectedWeek]=clone(state.routine[state.selectedWeek] || {});
    }else{
      state.routinesByMode[String(state.selectedMode)] = clone(state.routine);
    }
    state.selectedMode = nextMode;
    state.routine = clone(state.routinesByMode[nextMode] || PLAN.routineByMode?.[nextMode] || PLAN.routine);
    state.routinesByMode[nextMode] = state.routinesByMode[nextMode] || clone(PLAN.routineByMode?.[nextMode] || PLAN.routine);
    if(nextMode==="2" && typeof applyAdaptiveFullBodySelection==="function") applyAdaptiveFullBodySelection();
    state.days = clone(PLAN.modeDays[nextMode] || PLAN.days);
    // Los objetivos editados por el usuario se mantienen por modo; solo se crea el bloque si aún no existe.
    state.weeklyTargetsByMode = state.weeklyTargetsByMode || {};
    if(!state.weeklyTargetsByMode[nextMode]) state.weeklyTargetsByMode[nextMode] = clone(PLAN.weeklyTargetsByMode?.[nextMode] || PLAN.weeklyTargets || {});
    state.weeklyTargets = clone(state.weeklyTargetsByMode[nextMode]);
    state.selectedDay = state.days[0];
    state.selectedWeekday = weekdayOf(state.selectedDay) || WEEKDAYS[0];
    saveState();
    fillSelectors();
    resetTrainingDraft();
    renderAll();
  });
  $("#weekSelect").addEventListener("change", e => {
    collectDraftInputs();
    if(!confirmDiscardDraft()){ e.target.value = state.selectedWeek; return; }
    state.selectedWeek=e.target.value;
    if(String(state.selectedMode)==="2" && typeof applyAdaptiveFullBodySelection==="function") applyAdaptiveFullBodySelection();
    saveState(); resetTrainingDraft(); renderAll();
  });
  // Día de la semana: propone la sesión que toca ese día (se puede cambiar abajo).
  $("#weekdaySelect").addEventListener("change", e => {
    collectDraftInputs();
    const session = defaultSessionFor(e.target.value, state.days) || state.selectedDay;
    if(session !== state.selectedDay && !confirmDiscardDraft()){ e.target.value = state.selectedWeekday; return; }
    state.selectedWeekday = e.target.value;
    if(session !== state.selectedDay){ state.selectedDay = session; $("#daySelect").value = session; resetTrainingDraft(); }
    saveState(); saveDraftToStorage(); renderAll();
  });
  $("#daySelect").addEventListener("change", e => {
    collectDraftInputs();
    if(!confirmDiscardDraft()){ e.target.value = state.selectedDay; return; }
    state.selectedDay=e.target.value; saveState(); resetTrainingDraft(); renderAll();
  });
  ["sleepInput","energyInput","shoulderPainInput","neckPainInput","hamPainInput","motivationInput"].forEach(id => {
    $("#"+id).addEventListener("input", renderReadiness);
  });
  $("#saveSessionBtn").addEventListener("click", saveSession);
  $("#addExerciseBtn").addEventListener("click", addExercise);
  $("#addAlternativeBtn").addEventListener("click", addAddedExercise);
  $("#historySearch").addEventListener("input", renderHistory);
  $("#addCardioBtn").addEventListener("click", addCardio);
  $("#addWeightBtn").addEventListener("click", addWeight);
  $("#saveSettingsBtn").addEventListener("click", saveSettings);
  $("#resetBtn").addEventListener("click", resetApp);
  $("#resetTargetsBtn").addEventListener("click", resetTargetsFromPlan);
  $$(".export-json-btn").forEach(btn => btn.addEventListener("click", exportJson));
  $("#exportExcelBtn").addEventListener("click", exportExcel);
  $("#importInput").addEventListener("change", importData);
  $("#weightChartToggle").addEventListener("change", renderWeightChart);
  $("#exerciseProgressSelect").addEventListener("change", renderExerciseProgress);
  $("#rmExerciseSelect")?.addEventListener("change", render1RMCalculator);
  $("#rmLoadInput")?.addEventListener("input", render1RMCalculator);
  $("#rmRepsInput")?.addEventListener("input", render1RMCalculator);
  $("#rmUseLastBtn")?.addEventListener("click", useBestRecordFor1RM);
  $("#rmClearBtn")?.addEventListener("click", clear1RMCalculator);
  $("#updateAppBtn")?.addEventListener("click", updatePrimeOSNow);
}

const VIEWS = ["inicio","rutina","entrenar","historial","progreso","one-rm","cardio","nutricion","ajustes"];

function switchView(view){
  collectDraftInputs();
  $$(".nav-btn").forEach(b => b.classList.toggle("active", b.dataset.view===view));
  $$(".view").forEach(v => v.classList.toggle("active", v.id === `view-${view}`));
  applyBackgroundForView(view);
  refreshTopMeta(view);
  $("#sidebar").classList.remove("open");
  document.body.classList.remove("mobile-menu-open");
  renderAll();
  renderTimer();
  window.scrollTo({top: 0});
}

function applyBackgroundForView(view){
  VIEWS.forEach(v => document.body.classList.remove("bg-" + v));
  document.body.classList.add("bg-" + (VIEWS.includes(view) ? view : "inicio"));
}

function applySidebarPreference(){
  document.body.classList.toggle("sidebar-compact", Boolean(state.ui?.sidebarCompact));
}

function toggleSidebarCompact(){
  state.ui.sidebarCompact = !state.ui.sidebarCompact;
  saveState({touch:false});
  applySidebarPreference();
}

function bindLaunchScreen(){
  const launch = $("#launchScreen");
  const alreadyStarted = storageGet("sessionStorage", "prime_os_launch_seen") === "1";
  if(alreadyStarted){
    launch.classList.add("hidden");
    document.body.classList.add("app-started");
  } else {
    document.body.classList.add("launch-active");
  }

  $("#launchBtn").addEventListener("click", () => {
    storageSet("sessionStorage", "prime_os_launch_seen", "1");
    launch.classList.add("hidden");
    document.body.classList.remove("launch-active");
    document.body.classList.add("app-started");
    $("#sidebar").classList.remove("open");
    document.body.classList.remove("mobile-menu-open");
  });
}

function closeMobileMenu(){
  $("#sidebar").classList.remove("open");
  document.body.classList.remove("mobile-menu-open");
}

function bindMobileDrawer(){
  closeMobileMenu();

  document.addEventListener("click", (event) => {
    const sidebar = $("#sidebar");
    if(window.innerWidth > 980 || !sidebar.classList.contains("open")) return;
    if(!sidebar.contains(event.target) && !$("#menuBtn").contains(event.target)) closeMobileMenu();
  });

  document.addEventListener("keydown", (event) => {
    if(event.key === "Escape") closeMobileMenu();
  });

  window.addEventListener("resize", () => {
    if(window.innerWidth > 980) closeMobileMenu();
  });
}

/* ---------- Uso sin internet ---------- */

async function checkRemoteVersion(){
  // Handshake independiente del cache: si GitHub Pages ya publica una versión nueva,
  // el cliente actual la detecta incluso antes de que el service worker viejo termine de actualizarse.
  try{
    const res=await fetch("version.json?probe="+Date.now(),{cache:"no-store",credentials:"same-origin"});
    if(!res.ok) return;
    const remote=await res.json();
    const remoteVersion=String(remote.version||"").trim();
    if(remoteVersion && remoteVersion!==APP_VERSION){
      setUpdateStatus("Nueva versión "+remoteVersion+" detectada. Actualizando…");
      await updatePrimeOSNow();
    }
  }catch(err){ /* sin red: la app continúa con la versión instalada */ }
}

async function registerServiceWorker(){
  if(!("serviceWorker" in navigator) || !location.protocol.startsWith("http")) return;
  try{
    const reg = await navigator.serviceWorker.register("sw.js?v="+APP_VERSION, {updateViaCache:"none"});
    await reg.update();
    updateAppStatus(reg);
    if(reg.waiting) reg.waiting.postMessage({type:"SKIP_WAITING"});
    reg.addEventListener("updatefound", ()=>{
      const worker=reg.installing;
      if(!worker) return;
      worker.addEventListener("statechange", ()=>{
        if(worker.state==="installed"){
          updateAppStatus(reg);
          if(navigator.serviceWorker.controller) setUpdateStatus("Actualización lista. Aplicando…");
          worker.postMessage({type:"SKIP_WAITING"});
        }
      });
    });
    navigator.serviceWorker.addEventListener("controllerchange", ()=>{
      if(window.__primeReloading) return;
      window.__primeReloading=true;
      setUpdateStatus("Prime OS actualizado. Recargando…");
      location.reload();
    });
  }catch(err){ console.warn("Service worker no registrado:", err); }
}

function setUpdateStatus(message){
  const el=$("#updateStatus");
  if(el) el.textContent=message;
}

function updateAppStatus(reg){
  if(!reg) return;
  if(reg.waiting) setUpdateStatus("Nueva versión lista. Aplicando…");
  else setUpdateStatus("Versión instalada: "+APP_VERSION);
}

async function updatePrimeOSNow(){
  const btn=$("#updateAppBtn");
  if(btn){btn.disabled=true;btn.textContent="Comprobando…";}
  try{
    if(!("serviceWorker" in navigator)){ location.reload(); return; }
    const reg=await navigator.serviceWorker.getRegistration();
    if(!reg){ location.reload(); return; }
    setUpdateStatus("Buscando actualización…");
    await reg.update();
    if(reg.waiting){
      reg.waiting.postMessage({type:"SKIP_WAITING"});
      return;
    }
    // Sin waiting: cambia la URL de navegación para forzar una nueva entrada de red.
    // Los subrecursos ya llevan ?v=APP_VERSION y el SW usa updateViaCache:"none".
    setUpdateStatus("Prime OS ya está en "+APP_VERSION+". Recargando recursos…");
    setTimeout(()=>{
      const url=new URL(location.href);
      url.searchParams.set("v",APP_VERSION);
      url.searchParams.set("refresh",String(Date.now()));
      location.replace(url.toString());
    },250);
  }catch(err){
    setUpdateStatus("No se pudo comprobar. Recarga manualmente.");
    if(btn){btn.disabled=false;btn.textContent="Actualizar Prime OS";}
  }
}