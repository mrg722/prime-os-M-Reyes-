/* Node regression suite for the V10 pure volume layer. Run: node tests/v10_volume_engine.test.js */
const assert=require("assert");
global.window={};
global.stripAccents=s=>String(s||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"");
global.parseNumber=v=>{const n=Number(String(v??"").replace(",","."));return Number.isFinite(n)?n:null;};
global.parseRir=t=>{const s=String(t||"").toLowerCase();const m=s.match(/(\d+(?:\.\d+)?)(?:\s*-\s*(\d+(?:\.\d+)?))?/);if(!m)return null;const n=m[2]?(+m[1]+ +m[2])/2:+m[1];return /rpe|^@/.test(s)?10-n:n;};
global.setHasData=s=>Boolean(s&&(s.done||String(s.weight??"").trim()||String(s.repsDone??"").trim()));
global.bestSet=sets=>(sets||[]).filter(setHasData)[0]||null;
global.estimate1RM=s=>{const w=Number(s.weight),r=Number(s.repsDone);return w&&r?w*(1+r/30):null;};
global.SLEEP_SCORE={bueno:3,medio:2,malo:1};
const catalog=require("../js/exerciseCatalog.js");
const engine=require("../js/volumeEngine.js");

let stateBackup,planBackup;
function setup(sessions=[],weeks=["Semana 1"],targets={}){global.state={sessions,weeks,weeklyTargets:targets,selectedMode:"4",settings:{goalMode:"mixed"}};global.PLAN={weeklyTargetBandsByMode:{"4":{}},defaultMode:"4"};}
function session(week,exercise){return {id:Math.random(),week,exercises:[exercise],readiness:{energy:"4",sleep:"bueno",motivation:"4"}};}
function ex(name,muscle,sets){return {name,muscle,sets};}
function set(rir="2",pain="0"){return {done:true,weight:"80",repsDone:"8",rir,pain};}
function test(name,fn){try{fn();console.log("✓",name)}catch(e){console.error("✗",name);throw e;}}

test("Press banca: pecho directo + tríceps/deltoide indirectos",()=>{
  const c=engine.v10Contributions(session("Semana 1",ex("Press banca","pecho",[set()])));
  const chest=c.find(x=>x.muscle==="pecho"),tri=c.find(x=>x.muscle==="tríceps"),ant=c.find(x=>x.muscle==="deltoide_anterior");
  assert(chest&&chest.direct&&chest.weightedSets>0); assert(tri&&!tri.direct&&tri.weightedSets<chest.weightedSets); assert(ant&&!ant.direct);
});
test("Dominadas: espalda directa + bíceps indirecto",()=>{
  const c=engine.v10Contributions(session("Semana 1",ex("Dominadas","espalda/dorsal",[set()])));
  assert(c.find(x=>x.muscle==="espalda/dorsal"&&x.direct)); assert(c.find(x=>x.muscle==="bíceps"&&x.indirect));
});
test("Curl: bíceps directo",()=>{
  const c=engine.v10Contributions(session("Semana 1",ex("Curl barra","bíceps",[set()])));
  assert.strictEqual(c.length,2); assert(c.find(x=>x.muscle==="bíceps"&&x.direct));
});
test("Curl femoral no cuenta como brazos",()=>{
  const c=engine.v10Contributions(session("Semana 1",ex("Curl femoral sentado","Brazos",[set()])));
  assert(c.find(x=>x.muscle==="isquios")); assert(!c.find(x=>x.muscle==="bíceps"||x.muscle==="tríceps"));
});
test("RIR 1 aporta más que RIR 5 en mixed",()=>{
  const a=engine.v10Contributions(session("Semana 1",ex("Curl barra","bíceps",[set("1")])));
  const b=engine.v10Contributions(session("Semana 1",ex("Curl barra","bíceps",[set("5")])));
  assert(a[0].weightedSets>b[0].weightedSets);
});
test("RIR ausente no inventa RIR",()=>{
  const c=engine.v10Contributions(session("Semana 1",ex("Curl barra","bíceps",[set("")])));
  assert.strictEqual(c[0].rir,null); assert.strictEqual(c[0].rirKnown,false);
});
test("Warm-up no se contabiliza como serie efectiva",()=>{
  const s=set("2"); s.warmup=true;
  const c=engine.v10Contributions(session("Semana 1",ex("Curl barra","bíceps",[s])));
  assert.strictEqual(c.length,0);
});
test("15 series no se convierte en 150% de progreso",()=>{
  const sets=Array.from({length:15},()=>set("2"));
  setup([session("Semana 1",ex("Curl barra","bíceps",sets))],["Semana 1"],{"Semana 1":{"bíceps":10}});
  const x=engine.v10MuscleSummary("Semana 1","bíceps");
  assert(!("percentage" in x)); assert(x.weightedSets>10);
});
test("Ejercicio agregado conocido hereda catálogo",()=>{
  const meta=catalog.v10ExerciseMeta("Dominadas lastradas"); assert(meta); assert(meta.volumeWeights.bíceps===.5);
});
test("Ejercicio personalizado puede definir secundarios",()=>{
  const x=engine.v10ExerciseClassification({name:"Mi remo raro",muscle:"espalda/dorsal",secondaryMuscles:[{muscle:"bíceps",weight:.4}]});
  assert.strictEqual(x.volumeWeights.bíceps,.4);
});
test("Dolor no se transforma automáticamente en MRV",()=>{
  const s=set("2","7"); setup([session("Semana 1",ex("Curl barra","bíceps",[s]))],["Semana 1"],{"Semana 1":{"bíceps":5}});
  const x=engine.v10MuscleSummary("Semana 1","bíceps"); assert(x.status!=="OVERREACH_RISK");
});
test("Sin cuatro semanas comparables: MEV/MAV/MRV insuficientes",()=>{
  setup([session("Semana 1",ex("Curl barra","bíceps",[set()]))],["Semana 1"],{"Semana 1":{"bíceps":5}});
  const x=engine.v10MuscleSummary("Semana 1","bíceps"); assert.strictEqual(x.confidence,"INSUFFICIENT"); assert.strictEqual(x.mev,null);
});
test("Eliminar ejercicio elimina su contribución",()=>{
  const kept=engine.v10Contributions(session("Semana 1",ex("Curl barra","bíceps",[set()])));
  const removed=engine.v10Contributions({id:1,week:"Semana 1",exercises:[]});
  assert(kept.length>0); assert.strictEqual(removed.length,0);
});
test("3D/4D no se mezclan porque el motor usa la semana/sesión recibida",()=>{
  setup([session("Semana 1",ex("Curl barra","bíceps",[set()])),session("Semana 2",ex("Press banca","pecho",[set()]))],["Semana 1","Semana 2"]);
  assert(engine.v10Contributions(state.sessions[0]).every(x=>x.muscle==="bíceps"||x.muscle==="braquial"));
});
test("RDL distribuye isquios, glúteo y erectores",()=>{
  const c=engine.v10Contributions(session("Semana 1",ex("RDL","isquios",[set()])));
  assert(c.find(x=>x.muscle==="isquios"&&x.direct)); assert(c.find(x=>x.muscle==="glúteo"&&x.indirect)); assert(c.find(x=>x.muscle==="erectores"&&x.indirect));
});
test("Estado productivo no depende solo de cantidad",()=>{
  setup([session("Semana 1",ex("Curl barra","bíceps",Array.from({length:12},()=>set("2"))))],["Semana 1"],{"Semana 1":{"bíceps":10}});
  const x=engine.v10MuscleSummary("Semana 1","bíceps"); assert(x.status!=="MAV_ZONE" || x.confidence==="INSUFFICIENT");
});
console.log("V10 volume engine regression suite: OK");
