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

window.PrimeOSVolume={muscles:V10_MUSCLES,labels:V10_MUSCLE_LABELS,classify:v10ExerciseClassification,contributions:v10Contributions,analyzeWeek:v10AnalyzeWeek,summary:v10MuscleSummary,addMeta:v10AddExerciseMeta,catalog:v10CatalogOptions,rirFactor:v10RirFactor,observedBands:v10ObservedBands};

if(typeof module!=="undefined") module.exports={v10RirFactor,v10ExerciseClassification,v10Contributions,v10WeeklyMuscle,v10ObservedBands,v10MuscleSummary,v10AnalyzeWeek};
