// Reloj flotante: temporizador (cuenta regresiva) y cronómetro. Sigue corriendo al cambiar de sección o recargar.
// V10.6: se rediseña el temporizador; el cronómetro conserva su comportamiento original.
// V10.7: ruedas de minutos/segundos reescritas para arrastrar y elegir sin saltos.
const TIMER_KEY = "prime_os_timer_v1";
let timerState = {mode: "countdown", duration: 120, running: false, startedAt: 0, elapsedBefore: 0, finished: false, open: false};
let timerInterval = null;
let timerAudio = null;

function loadTimer(){
  try {
    const saved = JSON.parse(storageGet("localStorage", TIMER_KEY) || "null");
    if(saved && (saved.mode === "countdown" || saved.mode === "stopwatch")) timerState = {...timerState, ...saved};
  } catch(e){}
}

function saveTimer(){ storageSet("localStorage", TIMER_KEY, JSON.stringify(timerState)); }

function timerElapsed(){
  return timerState.elapsedBefore + (timerState.running ? (Date.now() - timerState.startedAt) / 1000 : 0);
}

// Ruedas de minutos y segundos. Cada ítem mide WHEEL_ITEM_H px (fijado también en CSS) y el valor
// elegido queda centrado. El valor se confirma solo cuando el usuario suelta y la rueda se detiene,
// así el dedo nunca pelea con la app mientras arrastra.
const WHEEL_ITEM_H = 44;
const WHEEL_SETTLE_MS = 140;

function wheelValueAt(el){
  const max = Number(el.dataset.max);
  return Math.max(0, Math.min(max, Math.round(el.scrollTop / WHEEL_ITEM_H)));
}

function markWheelItems(el, value){
  el.querySelectorAll(".timer-wheel-item").forEach(item => {
    const on = Number(item.dataset.value) === value;
    if(item.classList.contains("selected") !== on){
      item.classList.toggle("selected", on);
      item.setAttribute("aria-selected", String(on));
    }
  });
}

function buildTimerWheel(el, max){
  el.dataset.max = String(max);
  el.innerHTML = Array.from({length:max+1}, (_,v) => `<div class="timer-wheel-item" data-value="${v}" role="option" aria-selected="false">${String(v).padStart(2,"0")}</div>`).join("");
}

// Coloca la rueda en un valor sin disparar un cambio de duración.
function positionTimerWheel(el, value, smooth = false){
  el._programmatic = true;
  markWheelItems(el, value);
  if(smooth && typeof el.scrollTo === "function"){
    el._busy = true;
    el.scrollTo({top: value * WHEEL_ITEM_H, behavior: "smooth"});
    scheduleWheelSettle(el);
  } else {
    el.scrollTop = value * WHEEL_ITEM_H;
  }
}

function renderTimerWheels(){
  if(timerState.mode !== "countdown") return;
  const total = Math.max(0, Math.min(3600, Math.round(timerState.duration)));
  const values = {timerMinuteWheel: Math.floor(total / 60), timerSecondWheel: total % 60};
  const panelOpen = !$("#timerPanel")?.classList.contains("hidden");
  $("#timerPresets")?.classList.toggle("locked", timerState.running);
  Object.entries(values).forEach(([id, value]) => {
    const el = document.getElementById(id);
    // No se mueve una rueda que el usuario está tocando o que aún se está deteniendo.
    if(!el || el._busy || el._touching) return;
    if(!panelOpen){ markWheelItems(el, value); return; }
    if(Math.abs(el.scrollTop - value * WHEEL_ITEM_H) > 1) positionTimerWheel(el, value);
    else markWheelItems(el, value);
  });
}

function commitWheelValue(el, value){
  const isMinutes = el.id === "timerMinuteWheel";
  const current = Math.max(0, Math.min(3600, Math.round(timerState.duration)));
  let minutes = isMinutes ? value : Math.floor(current / 60);
  let seconds = isMinutes ? current % 60 : value;
  if(minutes >= 60){ minutes = 60; seconds = 0; }
  const total = Math.max(5, minutes * 60 + seconds);
  if(total !== timerState.duration){
    timerState.duration = total;
    timerState.elapsedBefore = 0;
    timerState.finished = false;
    saveTimer();
  }
  renderTimer();
}

function scheduleWheelSettle(el){
  clearTimeout(el._settleTimer);
  el._settleTimer = setTimeout(() => {
    if(el._touching) return; // se volverá a programar al soltar
    const userMoved = el._userMoved;
    el._busy = false;
    el._userMoved = false;
    el._programmatic = false;
    const value = wheelValueAt(el);
    // Si el navegador no ajustó al ítem, se ajusta aquí sin animación.
    if(Math.abs(el.scrollTop - value * WHEEL_ITEM_H) > 1){ el._programmatic = true; el.scrollTop = value * WHEEL_ITEM_H; }
    if(userMoved && !timerState.running) commitWheelValue(el, value);
    else renderTimerWheels();
  }, WHEEL_SETTLE_MS);
}

function bindTimerWheel(id, max){
  const el = $(id); if(!el) return;
  buildTimerWheel(el, max);
  el.tabIndex = 0;
  const startUser = () => { if(timerState.running) return; el._touching = true; el._busy = true; el._userMoved = true; el._programmatic = false; clearTimeout(el._settleTimer); };
  const endUser = () => { if(!el._touching) return; el._touching = false; scheduleWheelSettle(el); };
  el.addEventListener("touchstart", startUser, {passive:true});
  el.addEventListener("touchend", endUser, {passive:true});
  el.addEventListener("touchcancel", endUser, {passive:true});
  el.addEventListener("pointerdown", e => { if(e.pointerType === "mouse") startUser(); });
  window.addEventListener("pointerup", e => { if(e.pointerType === "mouse") endUser(); });
  el.addEventListener("wheel", () => { if(timerState.running) return; el._busy = true; el._userMoved = true; el._programmatic = false; scheduleWheelSettle(el); }, {passive:true});
  el.addEventListener("scroll", () => {
    // Solo se ilumina el número centrado; el valor se guarda al detenerse.
    markWheelItems(el, wheelValueAt(el));
    if(el._touching) return;
    if(el._busy || el._userMoved) scheduleWheelSettle(el);
  }, {passive:true});
  // Tocar un número sin arrastrar lo elige directamente.
  el.addEventListener("click", event => {
    const item = event.target.closest(".timer-wheel-item");
    if(!item || timerState.running) return;
    const value = Number(item.dataset.value);
    if(value === wheelValueAt(el)) return;
    el._userMoved = false;
    positionTimerWheel(el, value, true);
    commitWheelValue(el, value);
  });
  el.addEventListener("keydown", event => {
    if(timerState.running || !["ArrowUp","ArrowDown"].includes(event.key)) return;
    event.preventDefault();
    const value = Math.max(0, Math.min(max, wheelValueAt(el) + (event.key === "ArrowDown" ? 1 : -1)));
    positionTimerWheel(el, value);
    commitWheelValue(el, value);
  });
}

function formatClock(totalSeconds){
  const s = Math.max(0, Math.floor(totalSeconds));
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
  return h ? `${h}:${String(m).padStart(2,"0")}:${String(sec).padStart(2,"0")}` : `${m}:${String(sec).padStart(2,"0")}`;
}

function timerBeep(){
  try {
    if(!timerAudio) return;
    [0, 0.35, 0.7].forEach(offset => {
      const osc = timerAudio.createOscillator();
      const gain = timerAudio.createGain();
      osc.frequency.value = 880;
      gain.gain.setValueAtTime(0.25, timerAudio.currentTime + offset);
      gain.gain.exponentialRampToValueAtTime(0.001, timerAudio.currentTime + offset + 0.3);
      osc.connect(gain).connect(timerAudio.destination);
      osc.start(timerAudio.currentTime + offset);
      osc.stop(timerAudio.currentTime + offset + 0.3);
    });
  } catch(e){}
}

function finishCountdown(){
  timerState.running = false;
  timerState.elapsedBefore = timerState.duration;
  timerState.finished = true;
  saveTimer();
  try { navigator.vibrate?.([300, 120, 300, 120, 300]); } catch(e){}
  timerBeep();
}

function renderTimer(){
  const box = $("#timerPanel");
  if(!box) return;
  const countdown = timerState.mode === "countdown";
  const elapsed = timerElapsed();
  if(countdown && timerState.running && elapsed >= timerState.duration) finishCountdown();

  const shown = countdown ? timerState.duration - timerElapsed() : timerElapsed();
  const clockText = countdown && timerState.finished ? "¡Listo!" : formatClock(countdown ? Math.ceil(shown) : shown);
  $("#timerClock").textContent = clockText;
  box.classList.toggle("finished", countdown && timerState.finished);
  box.classList.toggle("running", timerState.running);

  // Botón flotante: visible en Registrar o mientras el reloj corre / terminó; muestra el tiempo.
  const fab = $("#clockFab");
  const active = timerState.running || (countdown && timerState.finished);
  const fabVisible = typeof currentView !== "function" || currentView() === "entrenar" || active || timerState.open;
  fab.classList.toggle("hidden", !fabVisible);
  document.body.classList.toggle("clock-visible", fabVisible);
  fab.classList.toggle("running", timerState.running);
  fab.classList.toggle("finished", countdown && timerState.finished);
  // Sin correr dice "Reloj"; corriendo o terminado muestra el tiempo.
  $("#clockFabLabel").textContent = active ? clockText : "Reloj";
  fab.title = "Reloj: temporizador y cronómetro";
  fab.setAttribute("aria-label", active ? `Reloj ${clockText}` : "Abrir reloj");
  fab.setAttribute("aria-expanded", String(timerState.open));
  box.classList.toggle("hidden", !timerState.open || !fabVisible);
  document.body.classList.toggle("clock-open", timerState.open && fabVisible);
  $("#timerStartBtn").textContent = timerState.running ? "Pausar" : (timerElapsed() > 0 && !timerState.finished ? "Seguir" : "Iniciar");
  $$("#timerPanel .timer-mode").forEach(b => b.classList.toggle("active", b.dataset.mode === timerState.mode));
  $$("#timerPanel .timer-preset").forEach(b => b.classList.toggle("active", countdown && Number(b.dataset.seconds) === timerState.duration));
  $("#timerPresets").classList.toggle("hidden", !countdown);
  if(countdown) renderTimerWheels();

  clearInterval(timerInterval);
  timerInterval = timerState.running ? setInterval(renderTimer, 250) : null;
}

function toggleTimer(){
  try {
    timerAudio = timerAudio || new (window.AudioContext || window.webkitAudioContext)();
    timerAudio.resume?.();
  } catch(e){}
  if(timerState.running){
    timerState.elapsedBefore = timerElapsed();
    timerState.running = false;
  } else {
    if(timerState.finished) resetTimer(false);
    timerState.startedAt = Date.now();
    timerState.running = true;
  }
  saveTimer();
  renderTimer();
}

function resetTimer(render = true){
  timerState.running = false;
  timerState.elapsedBefore = 0;
  timerState.finished = false;
  saveTimer();
  if(render) renderTimer();
}

function setTimerMode(mode){
  if(timerState.mode === mode) return;
  timerState.mode = mode;
  resetTimer();
}

function setTimerDuration(seconds){
  timerState.mode = "countdown";
  timerState.duration = Math.max(5, Math.min(3600, seconds));
  resetTimer();
}

function adjustTimer(delta){
  if(timerState.mode !== "countdown") return;
  if(timerState.running){
    // Durante la cuenta, ajusta el tiempo restante.
    timerState.duration = Math.max(Math.ceil(timerElapsed()) + 5, timerState.duration + delta);
  } else {
    timerState.duration = Math.max(5, Math.min(3600, timerState.duration + delta));
    timerState.finished = false;
  }
  saveTimer();
  renderTimer();
}

function setTimerOpen(open){
  timerState.open = open;
  saveTimer();
  renderTimer();
}

function bindTimer(){
  loadTimer();
  $("#clockFab").addEventListener("click", () => setTimerOpen(!timerState.open));
  $("#timerCloseBtn").addEventListener("click", () => setTimerOpen(false));
  $$("#timerPanel .timer-mode").forEach(b => b.addEventListener("click", () => setTimerMode(b.dataset.mode)));
  $$("#timerPanel .timer-preset").forEach(b => b.addEventListener("click", () => setTimerDuration(Number(b.dataset.seconds))));
  bindTimerWheel("#timerMinuteWheel", 60);
  bindTimerWheel("#timerSecondWheel", 59);
  $("#timerMinus1Btn")?.addEventListener("click", () => adjustTimer(-1));
  $("#timerPlus1Btn")?.addEventListener("click", () => adjustTimer(1));
  $("#timerMinusBtn").addEventListener("click", () => adjustTimer(-15));
  $("#timerPlusBtn").addEventListener("click", () => adjustTimer(15));
  $("#timerStartBtn").addEventListener("click", toggleTimer);
  $("#timerResetBtn").addEventListener("click", () => resetTimer());
  document.addEventListener("visibilitychange", () => { if(document.visibilityState === "visible") renderTimer(); });
  renderTimer();
}
