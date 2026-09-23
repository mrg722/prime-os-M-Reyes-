/* Prime OS V10: motor de volumen adaptativo. Separa dato bruto, contribución directa/indirecta y respuesta. */
const V10_MUSCLES = [
  "pecho","pecho_superior","espalda/dorsal","deltoide_anterior","deltoide_lateral","deltoide_posterior",
  "bíceps","tríceps","braquial","antebrazo","cuádriceps","isquios","glúteo","erectores","gemelos",
  "core","trapecio","escapula","manguito_rotador","aductores","abductores","oblicuos","cardio"
];

const V10_MUSCLE_LABELS = {
  pecho:"Pecho",pecho_superior:"Pecho superior","espalda/dorsal":"Espalda / dorsal",deltoide_anterior:"Deltoide anterior",
  deltoide_lateral:"Deltoide lateral",deltoide_posterior:"Deltoide posterior",bíceps:"Bíceps",tríceps:"Tríceps",
  braquial:"Braquial",antebrazo:"Antebrazo",cuádriceps:"Cuádriceps",isquios:"Isquios",glúteo:"Glúteo",
  erectores:"Erectores",gemelos:"Gemelos",core:"Core",trapecio:"Trapecio",escapula:"Escápula",
  manguito_rotador:"Manguito rotador",aductores:"Aductores",abductores:"Abductores",oblicuos:"Oblicuos",cardio:"Cardio"
};

function v10MuscleKey(raw){
  const s=stripAccents(String(raw||"").toLowerCase()).replace(/_/g," ").trim();
  if(!s) return "general";
  if(s.includes("pecho superior")) return "pecho_superior";
  if(s.includes("pecho")||s.includes("press")) return "pecho";
  if(s.includes("espalda")||s.includes("dorsal")||s.includes("remo")||s.includes("jalon")||s.includes("dominada")) return "espalda/dorsal";
  if(s.includes("deltoide anterior")||s.includes("hombro anterior")) return "deltoide_anterior";
  if(s.includes("deltoide posterior")||s.includes("pajarito")||s.includes("reverse")) return "deltoide_posterior";
  if(s.includes("deltoide")||s.includes("lateral")||s.includes("hombro")) return "deltoide_lateral";
  if(s.includes("triceps")||s.includes("pushdown")) return "tríceps";
  if(s.includes("biceps")||s==="brazo") return "bíceps";
  if(s.includes("braquial")) return "braquial";
  if(s.includes("antebrazo")) return "antebrazo";
  if(s.includes("cuad")) return "cuádriceps";
  if(s.includes("isqu")||s.includes("femoral")||s.includes("hamstring")) return "isquios";
  if(s.includes("glut")) return "glúteo";
  if(s.includes("erector")||s.includes("lumbar")) return "erectores";
  if(s.includes("gemelo")||s.includes("soleo")||s.includes("calf")) return "gemelos";
  if(s.includes("core")||s.includes("abdom")||s.includes("carry")) return "core";
  if(s.includes("trap")) return "trapecio";
  if(s.includes("escap")) return "escapula";
  if(s.includes("manguito")||s.includes("rotador")) return "manguito_rotador";
  if(s.includes("aductor")) return "aductores";
  if(s.includes("abductor")) return "abductores";
  if(s.includes("oblic")) return "oblicuos";
  if(s.includes("cardio")||s.includes("trote")||s.includes("zona")) return "cardio";
  return s;
}

function v10RirFromSet(set){
  const text=String(set?.rir||"").trim();
  if(!text) return null;
  if(typeof parseRir==="function") return parseRir(text);
  const m=text.replace(",",".").match(/(\d+(?:\.\d+)?)(?:\s*-\s*(\d+(?:\.\d+)?))?/);
  if(!m) return null;
  const n=m[2]?(Number(m[1])+Number(m[2]))/2:Number(m[1]);
  return /rpe|^@/i.test(text)?Math.max(0,10-n):n;
}

/* Factor operativo, no coeficiente fisiológico: el RIR modula la contribución, no decide si una serie "sirve". */
function v10RirFactor(rir,goalMode="mixed"){
  if(rir===null || rir===undefined || Number.isNaN(rir)) return {factor:1,known:false,band:"sin RIR"};
  const r=Math.max(0,Number(rir));
  if(goalMode==="strength") return {factor:r<=4?1:0.85,known:true,band:r<=1?"RIR 0-1":r<=2?"RIR 1-2":r<=4?"RIR 3-4":"RIR 5+"};
  if(goalMode==="hypertrophy"){
    if(r<=2) return {factor:1,known:true,band:"RIR 0-2"};
    if(r<=3) return {factor:.95,known:true,band:"RIR 2-3"};
    if(r<=4) return {factor:.8,known:true,band:"RIR 3-4"};
    if(r<=5) return {factor:.6,known:true,band:"RIR 4-5"};
    return {factor:.4,known:true,band:"RIR 5+"};
  }
  if(r<=2) return {factor:1,known:true,band:"RIR 0-2"};
  if(r<=3) return {factor:.95,known:true,band:"RIR 2-3"};
  if(r<=4) return {factor:.9,known:true,band:"RIR 3-4"};
  if(r<=5) return {factor:.7,known:true,band:"RIR 4-5"};
  return {factor:.5,known:true,band:"RIR 5+"};
}

function v10ExerciseClassification(ex){
  const raw=String(ex?.name||"").toLowerCase();
  if(/biceps.*triceps|triceps.*biceps|curl.*triceps|triceps.*curl/.test(raw)) return {id:null,name:ex?.name||"Bíceps + tríceps",sourceMuscle:ex?.muscle||"Brazos",normalizedMuscle:"bíceps",primaryMuscles:["bíceps","tríceps"],secondaryMuscles:[],volumeWeights:{"bíceps":1,"tríceps":1},movementPattern:"flexion_extension_codo",category:"aislamiento",countsAsVolume:true,custom:true};
  if(/laterales.*posterior|posterior.*laterales/.test(raw)) return {id:null,name:ex?.name||"Laterales + posterior",sourceMuscle:ex?.muscle||"Deltoides",normalizedMuscle:"deltoide_lateral",primaryMuscles:["deltoide_lateral"],secondaryMuscles:[{muscle:"deltoide_posterior",weight:.5}],volumeWeights:{"deltoide_lateral":1,"deltoide_posterior":.5},movementPattern:"abduccion_hombro",category:"aislamiento",countsAsVolume:true,custom:true};
  const meta=ex?.v10Meta || v10ExerciseMeta(ex?.name);
  if(meta) return {
    id:meta.id,name:meta.name,sourceMuscle:ex?.muscle||meta.sourceMuscle,
    normalizedMuscle:meta.primaryMuscles[0],primaryMuscles:meta.primaryMuscles,
    secondaryMuscles:meta.secondaryMuscles,volumeWeights:meta.volumeWeights,
    movementPattern:meta.movementPattern,category:meta.category,countsAsVolume:meta.countsAsVolume,
    custom:false
  };
  const primary=v10MuscleKey(ex?.normalizedMuscle||ex?.muscle);
  return {
    id:null,name:ex?.name||"Ejercicio",sourceMuscle:ex?.muscle||"general",normalizedMuscle:primary,
    primaryMuscles:[primary],secondaryMuscles:Array.isArray(ex?.secondaryMuscles)?ex.secondaryMuscles:[],
    volumeWeights:{[primary]:1,...Object.fromEntries((ex?.secondaryMuscles||[]).map(x=>[x.muscle,x.weight]))},
    movementPattern:ex?.movementPattern||"personalizado",category:ex?.category||"personalizado",
    countsAsVolume:ex?.countsAsVolume!==false,custom:true
  };
}

function v10SetRows(session,goalMode="mixed"){
  const rows=[];
  (session?.exercises||[]).forEach(ex=>{
    const cls=v10ExerciseClassification(ex);
    (ex.sets||[]).filter(setHasData).forEach((set,idx)=>{
      const warmup=Boolean(set.warmup||ex.warmup) || /calentamiento|warm.?up/i.test(String(set.feeling||"")+" "+String(set.weightNote||""));
      const rir=v10RirFromSet(set);
      const q=v10RirFactor(rir,goalMode);
      rows.push({session,exercise:ex,set,index:idx+1,classification:cls,warmup,rir,rirQuality:q,rawSet:1,countedSet:warmup?0:1});
    });
  });
  return rows;
}

function v10Contributions(session,goalMode="mixed"){
  const out=[];
  v10SetRows(session,goalMode).forEach(row=>{
    const cls=row.classification;
    if(row.warmup || !cls.countsAsVolume) return;
    Object.entries(cls.volumeWeights).forEach(([muscle,weight])=>{
      const primary=cls.primaryMuscles.includes(muscle);
      const weighted=Number(weight)*row.rirQuality.factor;
      out.push({
        sessionId:row.session.id,exerciseId:cls.id,exerciseName:row.exercise.name,muscle,
        direct:primary,indirect:!primary,rawSets:1,weightedSets:weighted,
        synergyWeight:Number(weight),rir:row.rir,rirKnown:row.rirQuality.known,rirQuality:row.rirQuality.factor,
        pain:Number(setPain(row.set)||0),warmup:false
      });
    });
  });
  return out;
}
function setPain(s){return parseNumber(s?.pain)??0;}

function v10WeekRows(week,goalMode="mixed"){
  const activeMode=String(state.selectedMode||PLAN.defaultMode||"4");
  return state.sessions.filter(s=>s.week===week && (!s.mode || String(s.mode)===activeMode));
}
function v10Readiness(sessions){
  const energy=sessions.map(s=>parseNumber(s.readiness?.energy)).filter(Number.isFinite);
  const sleep=sessions.map(s=>SLEEP_SCORE[s.readiness?.sleep]).filter(Number.isFinite);
  const motivation=sessions.map(s=>parseNumber(s.readiness?.motivation)).filter(Number.isFinite);
  const pain=sessions.flatMap(s=>(s.exercises||[]).flatMap(e=>(e.sets||[]).filter(setHasData).map(x=>setPain(x)))).filter(Number.isFinite);
  const avg=a=>a.length?a.reduce((x,y)=>x+y,0)/a.length:null;
  const en=avg(energy), sl=avg(sleep), mo=avg(motivation), pa=avg(pain);
  let fatigue=null;
  if(en!==null||sl!==null||mo!==null||pa!==null){
    const parts=[];
    if(en!==null) parts.push((6-en)/5*4);
    if(sl!==null) parts.push((3-sl)/2*2);
    if(mo!==null) parts.push((5-mo)/4*1);
    if(pa!==null) parts.push(pa/10*3);
    fatigue=Math.min(10,parts.reduce((a,b)=>a+b,0));
  }
  return {energy:en,sleep:sl,motivation:mo,pain:pa,fatigue,fatigueLevel:fatigue===null?"sin dato":fatigue>=6?"alta":fatigue>=3?"media":"baja"};
}

function v10PerformanceByMuscle(week,muscle){
  const current=state.sessions.filter(s=>s.week===week);
  const vals=[];
  current.forEach(s=>(s.exercises||[]).forEach(e=>{
    const cls=v10ExerciseClassification(e);
    if(!cls.primaryMuscles.includes(muscle)) return;
    const best=bestSet(e.sets||[]);
    const er=best?estimate1RM(best):null;
    if(er) vals.push(er);
  }));
  if(!vals.length) return null;
  return vals.reduce((a,b)=>a+b,0)/vals.length;
}
function v10PerformanceTrend(week,muscle){
  const idx=state.weeks.indexOf(week);
  if(idx<=0) return "→";
  const prev=v10PerformanceByMuscle(state.weeks[idx-1],muscle), cur=v10PerformanceByMuscle(week,muscle);
  if(prev===null||cur===null) return "→";
  const pct=(cur-prev)/prev*100;
  return pct>1?"↑":pct<-1?"↓":"→";
}

function v10WeeklyMuscle(week,muscle,goalMode="mixed"){
  const sessions=v10WeekRows(week,goalMode);
  const contrib=sessions.flatMap(s=>v10Contributions(s,goalMode)).filter(c=>c.muscle===muscle);
  const direct=contrib.filter(c=>c.direct).reduce((a,c)=>a+1,0);
  const indirect=contrib.filter(c=>c.indirect).reduce((a,c)=>a+1,0);
  const weighted=contrib.reduce((a,c)=>a+c.weightedSets,0);
  const raw=contrib.reduce((a,c)=>a+c.rawSets,0);
  const rirKnown=contrib.filter(c=>c.rirKnown).map(c=>c.rir);
  const pains=contrib.map(c=>c.pain).filter(Number.isFinite);
  const exposures=new Set(contrib.map(c=>c.sessionId)).size;
  const readiness=v10Readiness(sessions);
  return {week,muscle,rawSets:raw,directSets:direct,indirectSets:indirect,weightedSets:Number(weighted.toFixed(2)),
    rirMean:rirKnown.length?Number((rirKnown.reduce((a,b)=>a+b,0)/rirKnown.length).toFixed(1)):null,
    performanceTrend:v10PerformanceTrend(week,muscle),exposures,pain:pains.length?Number((pains.reduce((a,b)=>a+b,0)/pains.length).toFixed(1)):null,
    fatigue:readiness.fatigue,fatigueLevel:readiness.fatigueLevel};
}

function v10TargetRange(week,muscle){
  const bands=PLAN.weeklyTargetBandsByMode?.[String(state.selectedMode)]?.[week]||{};
  const raw=bands[muscle];
  if(/%/.test(String(raw||""))){ const t=state.weeklyTargets?.[week]?.[muscle]; return Number.isFinite(Number(t))&&Number(t)>0?[Number(t),Number(t)]:null; }
  const nums=String(raw??"").match(/\d+(?:\.\d+)?/g)?.map(Number)||[];
  if(nums.length>=2)return [nums[0],nums[1]];
  if(nums.length===1)return [nums[0],nums[0]];
  const t=state.weeklyTargets?.[week]?.[muscle];
  return Number.isFinite(Number(t)) && Number(t)>0 ? [Number(t),Number(t)] : null;
}

function v10WeekResponse(week,muscle){
  const cur=v10WeeklyMuscle(week,muscle), idx=state.weeks.indexOf(week);
  if(!cur.rawSets) return {score:null,label:"sin datos"};
  const trend=cur.performanceTrend;
  let score=0.5;
  if(trend==="↑") score+=0.35; else if(trend==="↓") score-=0.35;
  if(cur.fatigue!==null){if(cur.fatigue>=6)score-=.2; else if(cur.fatigue<=3)score+=.05;}
  if(cur.pain!==null){if(cur.pain>=5)score-=.25; else if(cur.pain<3)score+=.03;}
  if(idx===0 && trend==="→") score+=.05;
  const label=score>=.7?"productiva":score<=.25?"tensión/retroceso":"mixta";
  return {score:Number(Math.max(0,Math.min(1,score)).toFixed(2)),label};
}

function percentile(values,p){
  if(!values.length)return null; const a=[...values].sort((x,y)=>x-y), pos=(a.length-1)*p, lo=Math.floor(pos),hi=Math.ceil(pos);
  return lo===hi?a[lo]:a[lo]+(a[hi]-a[lo])*(pos-lo);
}

function v10ObservedBands(muscle){
  const weeks=state.weeks.map(w=>v10WeeklyMuscle(w,muscle)).filter(x=>x.rawSets>0);
  const productive=weeks.filter(w=>v10WeekResponse(w.week,muscle).label==="productiva").map(w=>w.weightedSets).filter(v=>v>0);
  const strain=weeks.filter(w=>{const r=v10WeekResponse(w.week,muscle);return r.label==="tensión/retroceso"&&w.fatigue!==null&&w.fatigue>=5;}).map(w=>w.weightedSets).filter(v=>v>0);
  if(weeks.length<4 || productive.length<2) return {mev:null,mavLow:null,mavHigh:null,mrv:null,evidenceWeeks:weeks.length,productiveWeeks:productive.length,confidence:"INSUFFICIENT"};
  const mev=Math.max(0,Number(Math.min(...productive).toFixed(1)));
  const mavLow=Number((percentile(productive,.25)).toFixed(1)), mavHigh=Number((percentile(productive,.75)).toFixed(1));
  const mrv=strain.length>=2?Number(Math.min(...strain).toFixed(1)):null;
  const rirCoverage=state.sessions.length?state.sessions.flatMap(s=>v10SetRows(s).map(r=>r.rir!==null)).filter(Boolean).length/Math.max(1,state.sessions.flatMap(s=>v10SetRows(s)).length):0;
  const confidence=weeks.length>=8&&productive.length>=4&&rirCoverage>=.6?"HIGH":weeks.length>=5?"MEDIUM":"LOW";
  return {mev,mavLow,mavHigh,mrv,evidenceWeeks:weeks.length,productiveWeeks:productive.length,confidence};
}

function v10Status(summary){
  if(summary.confidence==="INSUFFICIENT")return "INSUFFICIENT_DATA";
  const x=summary.weightedSets, t=summary.targetRange;
  if(summary.pain!==null&&summary.pain>=5)return "MRV_WARNING";
  if(summary.mrv!==null&&x>=summary.mrv&&summary.performanceTrend==="↓"&&summary.fatigueLevel==="alta")return "OVERREACH_RISK";
  if(summary.mev!==null&&x<summary.mev)return "BELOW_MEV";
  if(summary.mavLow!==null&&summary.mavHigh!==null&&x>=summary.mavLow&&x<=summary.mavHigh)return "MAV_ZONE";
  if(summary.mrv!==null&&x>=summary.mrv)return "HIGH_VOLUME";
  if(t&&x>=t[0]&&x<=t[1])return "MEV_ZONE";
  if(t&&x>t[1])return "HIGH_VOLUME";
  return "MEV_ZONE";
}

function v10Explain(summary){
  if(summary.status==="INSUFFICIENT_DATA")return "Aún no hay suficientes semanas comparables para estimar MEV/MAV/MRV.";
  if(summary.status==="OVERREACH_RISK")return "El volumen está alto y coincide con caída de rendimiento + fatiga alta; es compatible con una tolerancia menor al volumen actual. No demuestra causalidad por sí solo.";
  if(summary.status==="MRV_WARNING")return "Hay dolor relevante asociado al trabajo; el motor reduce la confianza de la interpretación y no atribuye automáticamente la caída de rendimiento al MRV.";
  if(summary.status==="BELOW_MEV")return "El volumen actual está por debajo del mínimo operativo observado en semanas productivas previas.";
  if(summary.status==="MAV_ZONE")return "El volumen está dentro del rango productivo observado, con la respuesta actual como contexto.";
  if(summary.status==="HIGH_VOLUME")return "El volumen es alto respecto al rango observado/objetivo; se necesita mirar rendimiento y recuperación antes de interpretarlo como exceso.";
  return "El volumen se interpreta junto con rendimiento, RIR, fatiga, dolor y número de exposiciones.";
}

function v10MuscleSummary(week,muscle,goalMode="mixed"){
  const base=v10WeeklyMuscle(week,muscle,goalMode), bands=v10ObservedBands(muscle), target=v10TargetRange(week,muscle);
  const summary={...base,targetRange:target,mev:bands.mev,mavLow:bands.mavLow,mavHigh:bands.mavHigh,mrv:bands.mrv,
    confidence:bands.confidence,evidenceWeeks:bands.evidenceWeeks,productiveWeeks:bands.productiveWeeks};
  summary.status=v10Status(summary); summary.explanation=v10Explain(summary); return summary;
}

function v10AnalyzeWeek(week=state.selectedWeek,goalMode="mixed"){
  return V10_MUSCLES.reduce((out,m)=>{out[m]=v10MuscleSummary(week,m,goalMode);return out;},{});
}

function v10AllContributions(week=state.selectedWeek,goalMode="mixed"){
  return state.sessions.filter(s=>s.week===week).flatMap(s=>v10Contributions(s,goalMode));
}

function v10AddExerciseMeta(exercise){
  const meta=v10ExerciseMeta(exercise?.name);
  if(meta) return {...exercise,v10Meta:{...meta},normalizedMuscle:meta.primaryMuscles[0],primaryMuscles:meta.primaryMuscles,secondaryMuscles:meta.secondaryMuscles,volumeWeights:meta.volumeWeights};
  return exercise;
}

function v10CatalogOptions(){
  return Object.values(V10_CATALOG).sort((a,b)=>a.name.localeCompare(b.name,"es"));
}


/* ---------- Full Body 2D adaptativo (V10.9): ajuste semanal sin acumulación ----------
   Base del 2D = state.routinesByMode["2"]: el plan de data/v9/adaptiveFullBody_N.json + las ediciones
   manuales hechas en Rutina (se guardan ya "limpias", ver v10AdaptiveStripWeek). La adaptación se calcula
   SIEMPRE desde esa base + lo registrado la semana anterior y se escribe solo en state.routine (vista activa).
   Nunca se escribe de vuelta en la base, así que recargar o cambiar de modo/semana no acumula ajustes. */

const V10_ADAPTIVE_TRACKED=["sets","load","reps","note","progression"];
const V10_ADAPTIVE_META=["adaptiveBase","adaptiveOut","adaptiveNote","adaptiveAction","adaptiveApplied"];

function v10AdaptiveWeekStatus(week){ return PLAN?.blockStatus?.[week]?.status || "base"; }
function v10AdaptiveBaseRoutine(week){
  return clone(state?.routinesByMode?.["2"]?.[week] || PLAN?.routineByMode?.["2"]?.[week] || {});
}
function v10AdaptivePrevSessions(week){
  const idx=state?.weeks?.indexOf(week); if(idx===undefined || idx<=0) return [];
  const prev=state.weeks[idx-1];
  return (state.sessions||[]).filter(s=>s.week===prev && (!s.mode || String(s.mode)==="2"));
}
function v10AdaptiveKey(ex){
  const meta=v10ExerciseMeta(ex?.name); if(meta) return meta.id;
  const src=String(ex?.sourceExercise||ex?.name||"").toLowerCase();
  if(/biceps.*triceps|triceps.*biceps|curl.*triceps/.test(src)) return "arms-combo";
  if(/gemel|soleo|calf/.test(src)) return "calves";
  if(/core|pallof|dead.?bug|hollow|plank|movilidad/.test(src)) return "core";
  return exerciseKeyBase(src);
}
// Rango de reps de trabajo: "4 x 8-10" → [8,10]; "1 top 5-8 + 3 backoff 6-8" → [6,8] (manda el backoff).
function v10AdaptiveRepRange(reps){
  const s=stripAccents(String(reps||"").toLowerCase()).replace(/\d+\s*x\s*/g," ").replace(/\d+\s*(top|backoff)\b/g," $1");
  const ranges=[...s.matchAll(/(\d+)\s*-\s*(\d+)/g)].map(m=>[Number(m[1]),Number(m[2])]);
  if(ranges.length) return ranges[ranges.length-1];
  const one=s.match(/\d+/); return one?[Number(one[0]),Number(one[0])]:null;
}
// RIR objetivo mínimo prescrito: "RIR 2-3" → 2; "Top RIR 1-2; backoff RIR 2" → 1.
function v10AdaptiveTargetRir(target){
  const nums=[...stripAccents(String(target||"")).matchAll(/RIR\s*(\d+(?:[.,]\d+)?)/gi)].map(m=>Number(m[1].replace(",",".")));
  return nums.length?Math.min(...nums):null;
}
function v10AdaptiveFirstLoad(load){ const m=String(load||"").match(/\d+(?:[.,]\d+)?/); return m?Number(m[0].replace(",",".")):null; }
function v10AdaptiveStats(ex,sessions){
  const key=v10AdaptiveKey(ex), matches=[];
  sessions.forEach(s=>(s.exercises||[]).forEach(e=>{
    if(v10AdaptiveKey(e)!==key) return;
    const sets=(e.sets||[]).filter(x=>setHasData(x) && !x.warmup && !/calentamiento|warm.?up/i.test(String(x.feeling||"")));
    if(sets.length) matches.push({session:s,exercise:e,sets});
  }));
  if(!matches.length) return null;
  const sets=matches.flatMap(x=>x.sets), rirs=sets.map(s=>v10RirFromSet(s)).filter(Number.isFinite);
  const pains=sets.map(s=>setPain(s)).filter(Number.isFinite), reps=sets.map(s=>repsCount(s.repsDone)).filter(Number.isFinite);
  const avg=a=>a.length?a.reduce((x,y)=>x+y,0)/a.length:null;
  return {sets:sets.length,avgRir:avg(rirs),maxPain:pains.length?Math.max(...pains):0,minReps:reps.length?Math.min(...reps):null,
    maxReps:reps.length?Math.max(...reps):null,target:matches.map(x=>x.exercise.target).find(Boolean)||""};
}
// Escala solo cargas de barra/máquina (≥ 80 en la unidad escrita); mancuernas, lastre y peso corporal progresan por reps.
function v10AdaptiveLoadText(load,direction){
  const s=String(load||"").trim(), first=v10AdaptiveFirstLoad(s);
  if(first===null || first<80 || /\bbw\b|peso corporal|^\s*\+/i.test(s)) return null;
  const factor=direction>0?1.025:0.95;
  return s.replace(/\d+(?:[.,]\d+)?/g,raw=>{
    const n=Number(raw.replace(",",".")); if(n<40) return raw;
    const v=n*factor, step=2.5, r=direction>0?Math.ceil(v/step)*step:Math.floor(v/step)*step;
    return String(Number(r.toFixed(1))).replace(/\.0$/,"");
  });
}
// Decide el ajuste de UN ejercicio comparando lo registrado vs lo prescrito la semana anterior.
function v10AdaptiveDecide(ex,stats,ctx){
  if(!stats) return {exercise:ex,action:null};
  const prevTarget=stats.target||ctx.prevEx?.target||"", targetRir=v10AdaptiveTargetRir(prevTarget);
  const range=v10AdaptiveRepRange(ctx.prevEx?.reps||ex.reps), rir=stats.avgRir, rirTxt=rir===null?"sin RIR":`RIR medio ${Number(rir.toFixed(1))}`;
  let kind="hold", text="";
  if(stats.maxPain>=4){ kind="down"; text=`dolor ${stats.maxPain}/10 la semana pasada: −5% y técnica limpia`; }
  else if(ctx.deloadNow){ kind="hold"; text="semana pivot: se respeta la descarga del plan"; }
  else if(ctx.deloadPrev){ kind="hold"; text="la semana anterior fue pivot: parte desde la carga del plan"; }
  else if(rir!==null && targetRir!==null && rir<targetRir-1){ kind="down"; text=`${rirTxt} bajo el objetivo (RIR ${targetRir}): −5%`; }
  else if(rir!==null && targetRir!==null && rir<targetRir){ kind="hold"; text=`${rirTxt} bajo el objetivo (RIR ${targetRir}): repetir carga`; }
  else if(range && stats.minReps!==null && stats.minReps>=range[1]){
    if(rir===null){ kind="reps"; text="tope de reps sin RIR anotado: +1 rep por serie (anota el RIR)"; }
    else if(ctx.planRises){ kind="hold"; text=`tope de reps con ${rirTxt}: el plan ya sube la carga esta semana`; }
    else { kind="up"; text=`tope de reps con ${rirTxt}: +2,5%`; }
  }
  else if(range && stats.minReps!==null && stats.minReps<range[0]){ kind="hold"; text=`no llegaste a ${range[0]} reps: repetir carga`; }
  else { kind="hold"; text="dentro del rango: repetir carga y sumar reps"; }
  const out={...ex};
  if(kind==="up" || kind==="down"){
    const next=v10AdaptiveLoadText(ex.load,kind==="up"?1:-1);
    if(next && next!==ex.load) out.load=next;
    else if(kind==="up"){ kind="reps"; text=text.replace("+2,5%","+1 rep por serie"); }
    else text=text.replace("−5%","bajar un escalón de carga");
  }
  out.adaptiveAction=kind; out.adaptiveNote=text;
  out.note=[ex.note,`Ajuste ${ctx.prevWeek}: ${text}.`].filter(Boolean).join(" · ");
  out.adaptiveBase=Object.fromEntries(V10_ADAPTIVE_TRACKED.filter(k=>k in ex).map(k=>[k,ex[k]]));
  out.adaptiveOut=Object.fromEntries(V10_ADAPTIVE_TRACKED.filter(k=>k in out).map(k=>[k,out[k]]));
  return {exercise:out,action:kind,text};
}
function v10AdaptiveFullBodyRoutine(week){
  const base=v10AdaptiveBaseRoutine(week); if(!base || !Object.keys(base).length) return {routine:base,actions:[],sourceWeek:null};
  const idx=state?.weeks?.indexOf(week); if(idx===undefined || idx<=0) return {routine:base,actions:[],sourceWeek:null};
  const prevWeek=state.weeks[idx-1], prevFlat=Object.values(v10AdaptiveBaseRoutine(prevWeek)).flat();
  const sessions=v10AdaptivePrevSessions(week), out={}, actions=[];
  const ctxBase={prevWeek,deloadNow:v10AdaptiveWeekStatus(week)==="pivot",deloadPrev:v10AdaptiveWeekStatus(prevWeek)==="pivot"};
  Object.entries(base).forEach(([day,exercises])=>{
    out[day]=(exercises||[]).map(ex=>{
      const key=v10AdaptiveKey(ex), prevEx=prevFlat.find(p=>v10AdaptiveKey(p)===key)||null;
      const a=v10AdaptiveFirstLoad(ex.load), b=v10AdaptiveFirstLoad(prevEx?.load);
      const r=v10AdaptiveDecide(ex,v10AdaptiveStats(ex,sessions),{...ctxBase,prevEx,planRises:a!==null&&b!==null&&a>b});
      if(r.action) actions.push({day,exercise:ex.name,action:r.action,detail:r.text});
      return r.exercise;
    });
  });
  return {routine:out,actions,sourceWeek:prevWeek};
}
// Devuelve la lista sin los ajustes automáticos: los campos que el usuario no tocó vuelven al valor base.
function v10AdaptiveStripList(list){
  return (list||[]).map(e=>{
    if(!e || typeof e!=="object") return e;
    const o={...e};
    if(e.adaptiveBase) Object.entries(e.adaptiveBase).forEach(([k,v])=>{ if(!e.adaptiveOut || e[k]===e.adaptiveOut[k]) o[k]=v; });
    V10_ADAPTIVE_META.forEach(k=>delete o[k]);
    return o;
  });
}
function v10AdaptiveStripWeek(weekRoutine){
  return Object.fromEntries(Object.entries(weekRoutine||{}).map(([day,list])=>[day,v10AdaptiveStripList(list)]));
}
// Guarda en la base 2D la semana activa (tras editar en Rutina), sin los ajustes automáticos.
function v10AdaptiveStoreWeek(week=state.selectedWeek){
  state.routinesByMode=state.routinesByMode||{};
  state.routinesByMode["2"]=state.routinesByMode["2"]||clone(PLAN.routineByMode?.["2"]||{});
  state.routinesByMode["2"][week]=v10AdaptiveStripWeek(clone(state.routine?.[week]||{}));
}
// Se recalcula en cada render/carga (es barato y determinista): sin atajos persistidos que dejen la vista obsoleta.
function applyAdaptiveFullBodySelection(){
  if(!state || String(state.selectedMode||"")!=="2") return;
  const week=state.selectedWeek;
  state.routinesByMode=state.routinesByMode||{};
  if(!state.routinesByMode["2"]) state.routinesByMode["2"]=clone(PLAN.routineByMode?.["2"]||{});
  const generated=v10AdaptiveFullBodyRoutine(week);
  state.routine=clone(state.routinesByMode["2"]);
  state.routine[week]=clone(generated.routine);
  state.meta=state.meta||{}; state.meta.adaptive2D=state.meta.adaptive2D||{};
  delete state.meta.adaptive2D.activeKey;
  const prev=state.meta.adaptive2D[week];
  if(!prev || JSON.stringify(prev.actions)!==JSON.stringify(generated.actions) || prev.sourceWeek!==generated.sourceWeek){
    state.meta.adaptive2D[week]={sourceWeek:generated.sourceWeek,actions:generated.actions,updatedAt:new Date().toISOString()};
  }
}

window.PrimeOSVolume={muscles:V10_MUSCLES,labels:V10_MUSCLE_LABELS,classify:v10ExerciseClassification,contributions:v10Contributions,analyzeWeek:v10AnalyzeWeek,summary:v10MuscleSummary,addMeta:v10AddExerciseMeta,catalog:v10CatalogOptions,rirFactor:v10RirFactor,observedBands:v10ObservedBands,adaptiveFullBodyRoutine:v10AdaptiveFullBodyRoutine,applyAdaptiveFullBodySelection,adaptiveStripWeek:v10AdaptiveStripWeek};

if(typeof module!=="undefined") module.exports={v10RirFactor,v10ExerciseClassification,v10Contributions,v10WeeklyMuscle,v10ObservedBands,v10MuscleSummary,v10AnalyzeWeek};
