// Pruebas de extremo a extremo de Prime OS en Chromium (Playwright).
// Uso: npm test   (levanta un servidor local, abre la app y recorre los flujos principales)
const http = require("http");
const fs = require("fs");
const path = require("path");
const os = require("os");
const { chromium } = require("playwright");

const ROOT = path.resolve(__dirname, "..");
const TYPES = {".html":"text/html", ".js":"text/javascript", ".css":"text/css", ".json":"application/json", ".png":"image/png", ".svg":"image/svg+xml", ".xlsx":"application/octet-stream"};

function serve(){
  const server = http.createServer((req, res) => {
    const url = decodeURIComponent(req.url.split("?")[0]);
    const file = path.join(ROOT, url === "/" ? "index.html" : url);
    if(!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()){ res.writeHead(404); res.end(); return; }
    res.writeHead(200, {"Content-Type": TYPES[path.extname(file)] || "application/octet-stream"});
    fs.createReadStream(file).pipe(res);
  });
  return new Promise(resolve => server.listen(0, () => resolve(server)));
}

let passed = 0;
const failures = [];
async function test(name, fn){
  try { await fn(); passed++; console.log(`  ✓ ${name}`); }
  catch(e){ failures.push(name); console.log(`  ✗ ${name}\n    ${e.message}`); }
}
function assert(cond, msg){ if(!cond) throw new Error(msg); }

(async () => {
  const server = await serve();
  const URL = `http://localhost:${server.address().port}/index.html`;
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "prime-os-"));
  const browser = await chromium.launch();

  // Abre la app limpia (o con datos previos en localStorage) y devuelve la página.
  async function open({viewport = {width:1366, height:900}, storage = null, context = null} = {}){
    const ctx = context || await browser.newContext({viewport, acceptDownloads: true, serviceWorkers: "block"});
    const page = await ctx.newPage();
    page.errors = [];
    page.on("pageerror", e => page.errors.push(e.message));
    page.on("console", m => { if(m.type() === "error" && !/404|Failed to load resource/.test(m.text())) page.errors.push(m.text()); });
    page.on("dialog", d => d.accept());
    if(storage) await page.addInitScript(s => { if(!sessionStorage.getItem("__seeded")){ localStorage.clear(); Object.entries(s).forEach(([k, v]) => localStorage.setItem(k, v)); sessionStorage.setItem("__seeded", "1"); } }, storage);
    await page.goto(URL);
    await page.waitForFunction(() => typeof state !== "undefined" && state && document.querySelector("#trainingForm"));
    const launch = page.locator("#launchBtn");
    if(await launch.isVisible()) await launch.click();
    return page;
  }
  const go = (page, view) => page.evaluate(v => switchView(v), view);
  const W = (ei, si) => `[data-ei="${ei}"][data-si="${si}"][data-field="weight"]`;
  const R = (ei, si) => `[data-ei="${ei}"][data-si="${si}"][data-field="repsDone"]`;

  console.log("Prime OS e2e");

  await test("versiones coinciden (app, service worker y caché)", async () => {
    const cfg = fs.readFileSync(path.join(ROOT, "js/config.js"), "utf8").match(/APP_VERSION = "([^"]+)"/)[1];
    const sw = fs.readFileSync(path.join(ROOT, "sw.js"), "utf8").match(/CACHE_VERSION = "([^"]+)"/)[1];
    const html = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");
    assert(cfg === sw, `APP_VERSION ${cfg} ≠ CACHE_VERSION ${sw}`);
    const versions = [...html.matchAll(/\?v=([\d.]+)/g)].map(m => m[1]);
    assert(versions.length && versions.every(v => v === cfg), `index.html usa ?v= distintos de ${cfg}: ${[...new Set(versions)]}`);
    const assets = [...fs.readFileSync(path.join(ROOT, "sw.js"), "utf8").matchAll(/^\s+"([^"]+)",?$/gm)].map(m => m[1]).filter(a => a !== "./");
    assets.forEach(a => assert(fs.existsSync(path.join(ROOT, a)), `sw.js guarda un archivo que no existe: ${a}`));
  });

  await test("version.json coincide con APP_VERSION", async () => {
    const versionFile = JSON.parse(fs.readFileSync(path.join(ROOT, "version.json"), "utf8"));
    const cfg = fs.readFileSync(path.join(ROOT, "js/config.js"), "utf8").match(/APP_VERSION = "([^"]+)"/)[1];
    assert(versionFile.version === cfg, `version.json ${versionFile.version} ≠ APP_VERSION ${cfg}`);
  });

  await test("arranca sin errores y con librerías locales", async () => {
    const page = await open();
    assert(await page.evaluate(() => typeof XLSX !== "undefined" && typeof Chart !== "undefined"), "XLSX o Chart no cargaron");
    for(const v of ["inicio","rutina","entrenar","historial","progreso","one-rm","cardio","nutricion","ajustes"]) await go(page, v);
    assert(!page.errors.length, page.errors.join(" | "));
    await page.context().close();
  });

  await test("peso de versiones antiguas se separa en número + unidad", async () => {
    const page = await open();
    const r = await page.evaluate(() => ({
      a: parseWeightText("27,5 kg por mano"), b: parseWeightText("75 lbs"), c: parseWeightText("peso corporal"),
      seed: state.sessions.find(s => s.id === 250002).exercises[0].sets[0]
    }));
    assert(r.a.weight === "27.5" && r.a.unit === "kg" && r.a.weightNote === "por mano", JSON.stringify(r.a));
    assert(r.b.weight === "75" && r.b.unit === "lbs", JSON.stringify(r.b));
    assert(r.c.weight === "" && r.c.weightNote === "peso corporal", JSON.stringify(r.c));
    assert(r.seed.weight === "75" && r.seed.unit === "lbs", JSON.stringify(r.seed));
    await page.context().close();
  });

  await test("músculos, catálogo de ejercicios y 1RM", async () => {
    const page = await open();
    const r = await page.evaluate(() => ({
      soleo: state.sessions.find(s => s.id === 250001).exercises.find(e => e.name.startsWith("Sóleo")).muscle,
      trabajo: normalizeMuscle("trabajo"), abs: normalizeMuscle("abs"),
      alias: canonicalExercise("Press inclinado manc.") === canonicalExercise("Press inclinado mancuernas top/backoff"),
      e1rm: estimate1RM({weight:"100", unit:"kg", repsDone:"5"}), epley: epley1RM(100,5),
      lbs: estimate1RM({weight:"100", unit:"lbs", repsDone:"1"}),
      noReps: estimate1RM({weight:"40", unit:"kg", repsDone:"similar S1"}),
      rir: [parseRir("RIR 2-3"), parseRir("@7"), parseRir("RPE 8"), parseRir("muchos")]
    }));
    assert(r.soleo === "gemelos", "sóleo " + r.soleo);
    assert(r.trabajo === "general" && r.abs === "core/control", "normalizeMuscle");
    assert(r.alias, "alias de ejercicio");
    assert(Math.abs(r.e1rm - 115) < 0.01 && Math.abs(r.epley - 115) < 0.01 && Math.abs(r.lbs - 45.36) < 0.01 && r.noReps === null, "1RM " + JSON.stringify(r));
    assert(JSON.stringify(r.rir) === "[2.5,3,2,5]", "RIR " + r.rir);
    await page.context().close();
  });

  await test("Registrar: el borrador sobrevive a cambiar de sección, editar la rutina y cerrar la app", async () => {
    const ctx = await browser.newContext({viewport: {width:390, height:844}, serviceWorkers: "block"});
    let page = await open({context: ctx});
    await page.evaluate(() => { state.selectedWeek = "Semana 3"; state.selectedDay = "Miércoles - Upper A"; saveState(); resetTrainingDraft(); renderAll(); });
    await go(page, "entrenar");
    await page.fill(W(0,0), "27,5"); await page.fill(R(0,0), "7");
    await page.selectOption('#trainingForm .exercise-card >> nth=0 >> select >> nth=0', "4");
    await page.fill(W(0,3), "20"); await page.fill(R(0,3), "10");
    await page.check('[data-ei="0"][data-si="0"][data-field="done"]');
    await page.fill("#sessionNotes", "nota");
    await go(page, "rutina"); await go(page, "progreso"); await go(page, "entrenar");
    assert(await page.inputValue(W(0,3)) === "20", "se perdió al cambiar de sección");
    await page.fill(R(0,3), "11");
    await page.close({runBeforeUnload: true});
    page = await open({context: ctx});
    await go(page, "entrenar");
    assert(await page.inputValue(R(0,3)) === "11" && await page.inputValue(W(0,0)) === "27,5", "se perdió al cerrar y reabrir");
    assert(await page.isChecked('[data-ei="0"][data-si="0"][data-field="done"]') && await page.inputValue("#sessionNotes") === "nota", "check o nota perdidos");
    assert(await page.textContent("#trainTitle") === "Miércoles · Upper A · Semana 3", "no volvió a la semana/día del borrador: " + await page.textContent("#trainTitle"));
    await page.click("#saveSessionBtn");
    const saved = await page.evaluate(() => state.sessions.at(-1).exercises[0].sets.map(s => [s.weight, s.unit, s.repsDone]));
    assert(JSON.stringify(saved[0]) === '["27.5","kg","7"]' && JSON.stringify(saved[3]) === '["20","kg","11"]', JSON.stringify(saved));
    assert(await page.evaluate(() => localStorage.getItem(DRAFT_KEY)) === null, "el borrador no se limpió al guardar");
    assert(await page.textContent("#pageTitle") === "Registrar", "título cambió tras guardar");
    await ctx.close();
  });

  await test("Registrar mantiene el diseño publicado (sin controles extra)", async () => {
    const page = await open({viewport: {width:390, height:844}});
    await go(page, "entrenar");
    const extra = await page.evaluate(() => document.querySelectorAll("#trainingForm .step-btn, #trainingForm .suggest-box, #restTimer, #repeatSessionBtn").length);
    assert(extra === 0, `hay ${extra} controles extra`);
    const headers = await page.$$eval("#trainingForm .set-table >> nth=0 >> th", ths => ths.map(t => t.textContent));
    assert(headers.join("|") === "Serie|Peso|Reps|RIR/RPE|Sensación|Descanso|Dolor|Check", headers.join("|"));
    await page.context().close();
  });

  await test("bajar series con datos pide confirmación", async () => {
    const page = await open();
    await go(page, "entrenar");
    await page.fill(W(0,2), "100");
    page.removeAllListeners("dialog");
    const msgs = [];
    page.on("dialog", d => { msgs.push(d.message()); d.dismiss(); });
    await page.selectOption('#trainingForm .exercise-card >> nth=0 >> select >> nth=0', "1");
    assert(msgs[0]?.includes("serie(s) con datos") && await page.inputValue(W(0,2)) === "100", "no pidió confirmación o borró la serie");
    await page.context().close();
  });

  await test("PR automático al guardar y en Progreso", async () => {
    const page = await open();
    await page.evaluate(() => { state.selectedWeek = "Semana 3"; state.selectedDay = "Viernes - Lower B"; resetTrainingDraft(); renderAll(); });
    await go(page, "entrenar");
    const msgs = [];
    page.removeAllListeners("dialog");
    page.on("dialog", d => { msgs.push(d.message()); d.accept(); });
    await page.fill(W(0,0), "140"); await page.fill(R(0,0), "8");
    await page.click("#saveSessionBtn");
    assert(msgs.some(m => m.includes("Nuevo PR") && m.includes("RDL principal")), msgs.join(" / "));
    await go(page, "progreso");
    assert((await page.textContent("#strengthProgress")).includes("177,3 kg"), "PR no aparece en Progreso");
    await page.selectOption("#exerciseProgressSelect", {label: "RDL principal / deadlift técnico solo si verde"});
    assert(await page.evaluate(() => !!charts.exerciseChart && charts.exerciseChart.data.datasets[0].data.length === 2), "gráfico por ejercicio no tiene 2 puntos (semi sumo + RDL)");
    await page.context().close();
  });

  await test("alertas de dolor y recordatorio de respaldo", async () => {
    const page = await open();
    await page.evaluate(() => {
      for(let i = 0; i < 3; i++) state.sessions.push({id: 900+i, date:`d${i}`, createdAt: new Date(2026, 0, i+1).toISOString(), week:"Semana 3", day:"Miércoles - Upper A",
        readiness:{shoulder:String(4+i), energy:"3", sleep:"medio"}, notes:"", exercises:[{name:"Press test", muscle:"pecho", sets:[{weight:"50", unit:"kg", repsDone:"8", pain:"5", done:true}]}]});
      state.meta.lastBackupAt = "";
      renderAll();
    });
    const alerts = await page.textContent("#alertsBox");
    assert(alerts.includes("Hombro: 3 sesiones seguidas") && alerts.includes("Press test: dolor"), alerts);
    assert(alerts.includes("Aún no has descargado ningún respaldo"), "falta recordatorio de respaldo");
    const [dl] = await Promise.all([page.waitForEvent("download"), page.click("#alertsBox .export-json-btn")]);
    assert(dl.suggestedFilename().endsWith(".json"), dl.suggestedFilename());
    assert(!(await page.textContent("#alertsBox")).includes("respaldo"), "el recordatorio no desaparece tras respaldar");
    await go(page, "progreso");
    assert(await page.evaluate(() => !!charts.readinessChart), "gráfico del semáforo no se dibujó");
    await page.context().close();
  });

  await test("Excel exportado se reimporta sin duplicar; respaldo JSON restaura todo", async () => {
    const page = await open();
    const snapshot = () => page.evaluate(() => JSON.stringify({s: state.sessions.map(sessionSignature).sort(), r: state.routine, w: state.weightLog.length, c: state.cardio.length},
      (k, x) => x && typeof x === "object" && !Array.isArray(x) ? Object.fromEntries(Object.keys(x).sort().map(key => [key, x[key]])) : x));
    const before = await snapshot();
    const [dl] = await Promise.all([page.waitForEvent("download"), page.click("#exportExcelBtn")]);
    const xlsx = path.join(tmp, "export.xlsx"); await dl.saveAs(xlsx);
    await page.setInputFiles("#importInput", xlsx); await page.waitForTimeout(500);
    assert(await snapshot() === before, "reimportar cambió los datos");
    await page.evaluate(() => { state.sessions = []; state.weightLog = []; state.cardio = []; Object.keys(state.routine).forEach(w => state.routine[w] = {}); saveState(); });
    await page.setInputFiles("#importInput", xlsx); await page.waitForTimeout(500);
    assert(await snapshot() === before, "el Excel no restauró todo");
    const [jdl] = await Promise.all([page.waitForEvent("download"), page.click(".top-actions .export-json-btn")]);
    const json = path.join(tmp, "backup.json"); await jdl.saveAs(json);
    await page.evaluate(() => { state.sessions = []; saveState(); });
    await page.setInputFiles("#importInput", json); await page.waitForTimeout(300);
    assert(await snapshot() === before, "el JSON no restauró todo");
    await page.setInputFiles("#importInput", path.join(ROOT, "Plantilla_Prime_OS_V7.xlsx")); await page.waitForTimeout(300);
    assert(await snapshot() === before, "importar la plantilla vacía cambió datos");
    await page.context().close();
  });

  await test("migración desde datos V7.2 conserva rutinas editadas", async () => {
    const plan = JSON.parse(fs.readFileSync(path.join(ROOT, "data/plan.json"), "utf8"));
    const routine = {"Semana 1": plan.legacyRoutine.normal, "Semana 2": {...plan.legacyRoutine.normal, "Martes - Lower A": [{name:"Mi ejercicio", sets:4, reps:"5", load:"100", target:"RIR 2", muscle:"pierna", note:""}]}, "Semana 3": {}};
    const page = await open({storage: {prime_os_martin_v7_2: JSON.stringify({weeks:["Semana 1","Semana 2","Semana 3"], routine, sessions:[
      {id:1, date:"x", week:"Semana 1", day:"Martes - Lower A", exercises:[{name:"Sentadilla alta", muscle:"pierna", sets:[{weight:"150 kg", reps:"4"}]}]}]})}});
    const r = await page.evaluate(() => ({weeks: state.weeks, s1: state.routine["Semana 1"]["Martes - Lower A"][0].name, s2: state.routine["Semana 2"]["Martes - Lower A"][0].name,
      set: state.sessions.find(s => s.id === 1).exercises[0].sets[0]}));
    assert(r.weeks.join(",") === plan.weeks.join(","), r.weeks.join(","));
    assert(r.s1 === plan.routine["Semana 1"]["Martes - Lower A"][0].name && r.s2 === "Mi ejercicio", `${r.s1} / ${r.s2}`);
    assert(r.set.weight === "150" && r.set.unit === "kg" && r.set.repsDone === "4", JSON.stringify(r.set));
    await page.context().close();
  });

  await test("Full Body A/B: la rutina original no cambia y cubren justo lo que falta", async () => {
    const plan = JSON.parse(fs.readFileSync(path.join(ROOT, "data/plan.json"), "utf8"));
    const original = plan.days.filter(d => !d.startsWith("Full Body "));
    assert(original.length === 7, "días originales: " + original.length);
    // Instantánea de la rutina original de V8.0 (sin los full body), tomada del historial de git si está disponible.
    let base = null;
    try { base = JSON.parse(require("child_process").execSync("git show 2364ad7:data/plan.json", {cwd: ROOT, stdio: ["ignore","pipe","ignore"]}).toString()); } catch(e){}
    if(base) plan.weeks.forEach(w => original.forEach(d => assert(JSON.stringify(plan.routine[w][d]) === JSON.stringify(base.routine[w][d]), `cambió ${w} / ${d}`)));
    if(base) assert(JSON.stringify(plan.weeklyTargets) === JSON.stringify(base.weeklyTargets), "cambiaron los objetivos semanales");
    plan.weeks.forEach(w => {
      const planned = {};
      plan.days.forEach(d => (plan.routine[w][d] || []).forEach(e => { planned[e.muscle] = (planned[e.muscle] || 0) + Number(e.sets); }));
      Object.entries(plan.weeklyTargets[w]).forEach(([m, t]) => {
        const fb = ["Full Body A","Full Body B"].flatMap(d => plan.routine[w][d]).filter(e => e.muscle === m).reduce((a, e) => a + e.sets, 0);
        const total = planned[m] || 0;
        assert(total >= t, `${w} ${m}: plan ${total} < objetivo ${t}`);
        if(fb) assert(total === t, `${w} ${m}: los full body se pasan del objetivo (${total} > ${t})`);
      });
    });
  });

  await test("Full Body se agrega a datos ya guardados sin tocar lo editado", async () => {
    const page0 = await open();
    const saved = await page0.evaluate(() => {
      const s = JSON.parse(JSON.stringify(state));
      s.days = s.days.filter(d => !d.startsWith("Full Body "));
      Object.values(s.routine).forEach(w => { delete w["Full Body A"]; delete w["Full Body B"]; });
      delete s.fullBodyVersion;
      s.routine["Semana 3"]["Martes - Lower A"][0].name = "Editado por mí";
      return JSON.stringify(s);
    });
    await page0.context().close();
    const page = await open({storage: {prime_os_martin_v7_3: saved}});
    const r = await page.evaluate(() => ({days: state.days, fb: state.routine["Semana 3"]["Full Body A"].map(e => e.name), edited: state.routine["Semana 3"]["Martes - Lower A"][0].name}));
    assert(r.days.at(-2) === "Full Body A" && r.days.at(-1) === "Full Body B", r.days.join(","));
    assert(r.fb[0] === "Curl femoral sentado", r.fb.join(","));
    assert(r.edited === "Editado por mí", "se pisó una edición: " + r.edited);
    await page.context().close();
  });

  await test("V10.6: calculadora 1RM Epley visible y repertorio auditado", async () => {
    const page = await open();
    await go(page, "one-rm");
    assert(await page.isVisible("#rmExerciseSelect"), "selector 1RM no visible");
    const options = await page.locator("#rmExerciseSelect option").count();
    assert(options >= 91, "repertorio 1RM insuficiente: " + options);
    const audited = await page.$eval("#rmExerciseSelect option", opts => opts.map(o => o.textContent));
    assert(audited.some(x => x.startsWith("Fondos ·")) && audited.some(x => x.startsWith("Peso muerto semi-sumo ·")), "faltan ejercicios auditados en 1RM");
    await page.fill("#rmLoadInput", "100");
    await page.fill("#rmRepsInput", "5");
    assert((await page.textContent("#rmResultValue")).includes("115"), await page.textContent("#rmResultValue"));
    assert((await page.textContent("#rmResultDetail")).includes("100") && (await page.textContent("#rmResultDetail")).includes("0,03"), await page.textContent("#rmResultDetail"));
    await page.context().close();
  });

  await test("V10.6: temporizador conserva ±15, añade ±1 y rueda táctil", async () => {
    const page = await open({viewport:{width:390,height:844}});
    await page.click("#clockFab");
    assert(await page.isVisible("#timerMinuteWheel") && await page.isVisible("#timerSecondWheel"), "ruedas del temporizador no visibles");
    assert(await page.isVisible("#timerMinusBtn") && await page.isVisible("#timerPlusBtn"), "±15 desapareció");
    assert(await page.isVisible("#timerMinus1Btn") && await page.isVisible("#timerPlus1Btn"), "±1 no existe");
    await page.click("#timerPlus1Btn");
    assert((await page.textContent("#timerClock")).includes("2:01"), "±1 no ajustó el temporizador");
    await page.click('[data-mode="stopwatch"]');
    assert(await page.isVisible("#timerStartBtn") && !(await page.isVisible("#timerMinuteWheel")), "cronómetro fue alterado");
    await page.context().close();
  });

  await test("reloj flotante: temporizador y cronómetro", async () => {
    const page = await open({viewport: {width:390, height:844}});
    assert(await page.locator("#clockFab").isHidden(), "el reloj no debería verse en Inicio si no corre");
    await go(page, "entrenar");
    assert(await page.locator("#timerPanel").isHidden(), "el panel debe partir cerrado");
    await page.click("#clockFab");
    assert(await page.locator("#timerPanel").isVisible(), "no abrió el panel");
    await page.click('.timer-preset[data-seconds="60"]');
    assert(await page.textContent("#timerClock") === "1:00", "preset 1:00");
    await page.click("#timerPlusBtn");
    assert(await page.textContent("#timerClock") === "1:15", "+15 s");
    await page.evaluate(() => setTimerDuration(5));
    await page.click("#timerStartBtn");
    await go(page, "progreso");
    assert(await page.locator("#clockFab").isVisible() && /^0:0\d$/.test(await page.textContent("#clockFabLabel")), "el botón no muestra la cuenta fuera de Registrar");
    await go(page, "entrenar");
    await page.waitForTimeout(5600);
    assert(await page.textContent("#timerClock") === "¡Listo!" && await page.evaluate(() => $("#timerPanel").classList.contains("finished")), "no terminó la cuenta regresiva");
    await page.click('.timer-mode[data-mode="stopwatch"]');
    await page.click("#timerStartBtn"); await page.waitForTimeout(2300);
    assert(await page.textContent("#timerClock") === "0:02", "cronómetro " + await page.textContent("#timerClock"));
    await page.click("#timerStartBtn");
    await page.reload(); await page.waitForFunction(() => typeof state !== "undefined" && state);
    assert(await page.evaluate(() => timerState.mode === "stopwatch" && Math.floor(timerElapsed()) === 2), "no recordó el cronómetro tras recargar");
    await go(page, "entrenar");
    await page.click("#timerResetBtn");
    assert(await page.textContent("#timerClock") === "0:00", "reiniciar");
    await page.click("#timerCloseBtn");
    assert(await page.locator("#timerPanel").isHidden() && await page.locator("#clockFab").isVisible(), "la X no cerró el panel");
    await page.context().close();
  });

  await test("día de la semana y sesión por separado + modos 2D/3D/4D", async () => {
    const page = await open({viewport: {width:390, height:844}});
    const assertOptions = async expected => {
      const labels = await page.$$eval("#daySelect option", o => o.map(x => x.textContent));
      assert(labels.join("|") === expected.join("|"), labels.join("|"));
    };

    // 3D: Upper A + Lower A + Full Body Excel + cardio.
    assert(await page.inputValue("#modeSelect") === "3", "modo inicial");
    await assertOptions(["Lower A","Upper A","Full Body · Excel","Cardio/Abs/Movilidad"]);
    await page.selectOption("#weekdaySelect", "Martes");
    assert(await page.inputValue("#daySelect") === "Martes - Upper A", "3D: Martes no propuso Upper A");

    // 4D: Upper/Lower completos + cardio.
    await page.selectOption("#modeSelect", "4");
    await assertOptions(["Lower A","Lower B","Upper A","Upper B","Cardio/Abs/Movilidad"]);
    await page.selectOption("#weekdaySelect", "Jueves");
    await page.selectOption("#daySelect", "Jueves - Cardio/Abs/Movilidad");
    await go(page, "entrenar");
    assert(await page.textContent("#trainTitle") === "Jueves · Cardio/Abs/Movilidad · Semana 1", await page.textContent("#trainTitle"));

    // 2D: dos Full Body adaptativos + cardio placeholder.
    await page.selectOption("#modeSelect", "2");
    await assertOptions(["Full Body A · Adaptativo 2D","Full Body B · Adaptativo 2D","Cardio/Abs/Movilidad · Adaptativo 2D"]);
    await page.selectOption("#daySelect", "Full Body A · Adaptativo 2D");
    await go(page, "entrenar");
    assert((await page.inputValue('[data-ei="0"][data-field="name"]')) === "Press banco plano", "no cargó el Full Body A 2D");

    // El modo queda registrado en sesiones nuevas y no mezcla rutinas entre modos.
    await page.fill('[data-ei="0"][data-si="0"][data-field="weight"]', "90");
    await page.fill('[data-ei="0"][data-si="0"][data-field="repsDone"]', "8");
    await page.click("#saveSessionBtn");
    const saved = await page.evaluate(() => state.sessions.at(-1));
    assert(saved.mode === "2" && saved.day === "Full Body A · Adaptativo 2D", JSON.stringify(saved));

    await page.selectOption("#modeSelect", "3");
    assert(await page.inputValue("#modeSelect") === "3", "no volvió a 3D");
    await page.context().close();
  });

  await test("ejercicio agregado aparece al inicio y la franja Sistema/Objetivo va al final", async () => {
    const page = await open();
    await go(page, "entrenar");
    const first = await page.inputValue('[data-ei="0"][data-field="name"]');
    await page.click("#addAlternativeBtn");
    assert(await page.inputValue('[data-ei="0"][data-field="name"]') === "Ejercicio agregado" && await page.inputValue('[data-ei="1"][data-field="name"]') === first, "no quedó primero");
    await go(page, "rutina");
    await page.click("#addExerciseBtn");
    assert((await page.textContent("#routineList .exercise-card h4")) === "Nuevo ejercicio", "Rutina: no quedó primero");
    const order = await page.evaluate(() => { const main = document.querySelector("main"); const kids = [...main.children]; return kids.indexOf(document.querySelector(".quick-ribbon")) === kids.length - 1; });
    assert(order, "la franja no está al final");
    await page.context().close();
  });

  await test("funciona sin internet (service worker)", async () => {
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    await page.goto(URL);
    await page.evaluate(() => navigator.serviceWorker.ready);
    await page.reload();
    await page.waitForFunction(() => navigator.serviceWorker.controller);
    await ctx.setOffline(true);
    await page.reload();
    await page.waitForFunction(() => typeof state !== "undefined" && state && typeof Chart !== "undefined" && typeof XLSX !== "undefined");
    assert((await page.textContent("#todayRoutineTitle")).includes("Semana"), "no cargó offline");
    await ctx.close();
  });

  await browser.close();
  server.close();
  console.log(`\n${passed} pasaron, ${failures.length} fallaron`);
  process.exit(failures.length ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
