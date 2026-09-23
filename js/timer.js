// Reloj flotante: temporizador (cuenta regresiva) y cronómetro. Sigue corriendo al cambiar de sección o recargar.
// V10.6: se rediseña el temporizador; el cronómetro conserva su comportamiento original.
const TIMER_KEY = "prime_os_timer_v1";
let timerState = {mode: "countdown", duration: 120, running: false, startedAt: 0, elapsedBefore: 0, finished: false, open: false};
let timerInterval = null;
let timerAudio = null;
let timerWheelSyncing = false;

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

function renderTimerWheel(id, max, selected){
  const el=$(id); if(!el) return;
  const current=String(selected);
  if(el.dataset.value===current && el.children.length===max+1) return;
  el.innerHTML=Array.from({length:max+1},(_,v)=>`<button type="button" class="timer-wheel-item ${v===selected?"selected":""}" data-value="${v}" role="option" aria-selected="${v===selected}">${String(v).padStart(2,"0")}</button>`).join("");
  el.dataset.value=current;
  requestAnimationFrame(()=>{ el.scrollTop=selected*42; });
}

function renderTimerWheels(){
  if(timerState.mode!=="countdown") return;
  const total=Math.max(0,Math.round(timerState.duration));
  renderTimerWheel("#timerMinuteWheel",60,Math.floor(total/60));
  renderTimerWheel("#timerSecondWheel",59,total%60);
  $$(".timer-wheel-item").forEach(item=>item.classList.toggle("selected",Number(item.dataset.value)===(item.parentElement.id==="timerMinuteWheel"?Math.floor(total/60):total%60)));
}

function syncTimerFromWheels(){
  if(timerWheelSyncing || timerState.mode!=="countdown") return;
  const mw=$("#timerMinuteWheel"), sw=$("#timerSecondWheel");
  if(!mw||!sw) return;
  const minutes=Math.round(mw.scrollTop/42), seconds=Math.round(sw.scrollTop/42);
  const total=Math.max(5,Math.min(3600,minutes*60+seconds));
  if(total===timerState.duration) return;
  timerState.duration=total; timerState.finished=false; saveTimer();
  timerWheelSyncing=true;
  renderTimer();
  timerWheelSyncing=false;
}

function bindTimerWheel(id){
  const el=$(id); if(!el) return;
  let raf=0;
  el.addEventListener("scroll",()=>{
    cancelAnimationFrame(raf);
    raf=requestAnimationFrame(()=>{
      const snapped=Math.round(el.scrollTop/42)*42;
      if(Math.abs(el.scrollTop-snapped)>1) el.scrollTo({top:snapped,behavior:"smooth"});
      el.querySelectorAll(".timer-wheel-item").forEach(item=>{
        const selected=Math.abs(Number(item.dataset.value)*42-el.scrollTop)<22;
        item.classList.toggle("selected",selected);
        item.setAttribute("aria-selected",String(selected));
      });
      syncTimerFromWheels();
    });
  },{passive:true});
  el.addEventListener("click",event=>{
    const item=event.target.closest(".timer-wheel-item"); if(!item) return;
    el.scrollTo({top:Number(item.dataset.value)*42,behavior:"smooth"});
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
  bindTimerWheel("#timerMinuteWheel");
  bindTimerWheel("#timerSecondWheel");
  $("#timerMinus1Btn")?.addEventListener("click", () => adjustTimer(-1));
  $("#timerPlus1Btn")?.addEventListener("click", () => adjustTimer(1));
  $("#timerMinusBtn").addEventListener("click", () => adjustTimer(-15));
  $("#timerPlusBtn").addEventListener("click", () => adjustTimer(15));
  $("#timerStartBtn").addEventListener("click", toggleTimer);
  $("#timerResetBtn").addEventListener("click", () => resetTimer());
  document.addEventListener("visibilitychange", () => { if(document.visibilityState === "visible") renderTimer(); });
  renderTimer();
}
