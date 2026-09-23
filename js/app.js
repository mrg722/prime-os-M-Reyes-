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
  if(restored) toast("Recuperé tu registro sin guardar. Sigue donde quedaste en Registrar.", "info", 6000);
  registerServiceWorker();
}

function fillSelectors(){
  const week = $("#weekSelect"), exp = $("#exportWeekSelect");
  week.innerHTML = state.weeks.map(w=>`<option ${w===state.selectedWeek?"selected":""}>${escapeHtml(w)}</option>`).join("");
  exp.innerHTML = state.weeks.map(w=>`<option ${w===state.selectedWeek?"selected":""}>${escapeHtml(w)}</option>`).join("")
    + `<option value="${ALL_WEEKS}">Todas las semanas</option>`;
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
  $("#weekSelect").addEventListener("change", e => {
    collectDraftInputs();
    if(!confirmDiscardDraft()){ e.target.value = state.selectedWeek; return; }
    state.selectedWeek=e.target.value; $("#exportWeekSelect").value=e.target.value;
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
}

const VIEWS = ["inicio","rutina","entrenar","historial","progreso","cardio","nutricion","ajustes"];

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

function registerServiceWorker(){
  if(!("serviceWorker" in navigator) || !location.protocol.startsWith("http")) return;
  // La recarga al llegar una versión nueva la hace el script de index.html; el registro sin
  // guardar se guarda al salir de la página (pagehide), así que no se pierde.
  navigator.serviceWorker.register("sw.js").catch(err => console.warn("Service worker no registrado:", err));
}
