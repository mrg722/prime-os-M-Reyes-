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

  await test("arranca sin errores y con librerías locales", async () => {
    const page = await open();
    assert(await page.evaluate(() => typeof XLSX !== "undefined" && typeof Chart !== "undefined"), "XLSX o Chart no cargaron");
    for(const v of ["inicio","rutina","entrenar","historial","progreso","cardio","nutricion","ajustes"]) await go(page, v);
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
      e1rm: estimate1RM({weight:"100", unit:"kg", repsDone:"5"}),
      lbs: estimate1RM({weight:"100", unit:"lbs", repsDone:"1"}),
      noReps: estimate1RM({weight:"40", unit:"kg", repsDone:"similar S1"}),
      rir: [parseRir("RIR 2-3"), parseRir("@7"), parseRir("RPE 8"), parseRir("muchos")]
    }));
    assert(r.soleo === "gemelos", "sóleo " + r.soleo);
    assert(r.trabajo === "general" && r.abs === "core/control", "normalizeMuscle");
    assert(r.alias, "alias de ejercicio");
    assert(Math.abs(r.e1rm - 116.67) < 0.01 && Math.abs(r.lbs - 45.36) < 0.01 && r.noReps === null, "1RM " + JSON.stringify(r));
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
    assert(await page.textContent("#trainTitle") === "Miércoles - Upper A · Semana 3", "no volvió a la semana/día del borrador");
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
    await page.selectOption("#exportWeekSelect", "__all__");
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
