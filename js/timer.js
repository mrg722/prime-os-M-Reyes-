// Temporizador (cuenta regresiva) y cronómetro de Registrar. Sigue corriendo al cambiar de sección o recargar.
const TIMER_KEY = "prime_os_timer_v1";
let timerState = {mode: "countdown", duration: 120, running: false, startedAt: 0, elapsedBefore: 0, finished: false};
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
  $("#timerClock").textContent = countdown && timerState.finished ? "¡Listo!" : formatClock(countdown ? Math.ceil(shown) : shown);
  box.classList.toggle("finished", countdown && timerState.finished);
  box.classList.toggle("running", timerState.running);
  $("#timerStartBtn").textContent = timerState.running ? "Pausar" : (timerElapsed() > 0 && !timerState.finished ? "Seguir" : "Iniciar");
  $$("#timerPanel .timer-mode").forEach(b => b.classList.toggle("active", b.dataset.mode === timerState.mode));
  $$("#timerPanel .timer-preset").forEach(b => b.classList.toggle("active", countdown && Number(b.dataset.seconds) === timerState.duration));
  $("#timerPresets").classList.toggle("hidden", !countdown);

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

function bindTimer(){
  loadTimer();
  $$("#timerPanel .timer-mode").forEach(b => b.addEventListener("click", () => setTimerMode(b.dataset.mode)));
  $$("#timerPanel .timer-preset").forEach(b => b.addEventListener("click", () => setTimerDuration(Number(b.dataset.seconds))));
  $("#timerMinusBtn").addEventListener("click", () => adjustTimer(-15));
  $("#timerPlusBtn").addEventListener("click", () => adjustTimer(15));
  $("#timerStartBtn").addEventListener("click", toggleTimer);
  $("#timerResetBtn").addEventListener("click", () => resetTimer());
  document.addEventListener("visibilitychange", () => { if(document.visibilityState === "visible") renderTimer(); });
  renderTimer();
}
