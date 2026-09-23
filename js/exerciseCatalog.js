/* Prime OS V10: catálogo estructurado. Los coeficientes son convenciones operativas configurables, no verdades fisiológicas exactas. */
const V10_EXERCISE_DEFS = [
["press-banca","Press banca","pecho","tríceps:.5,deltoide_anterior:.25","empuje_horizontal","compuesto"],
["press-banca-pausado","Press banca pausado","pecho","tríceps:.5,deltoide_anterior:.25","empuje_horizontal","fuerza"],
["press-inclinado-barra","Press inclinado barra","pecho_superior","tríceps:.5,deltoide_anterior:.5","empuje_inclinado","compuesto"],
["press-inclinado-mancuernas","Press inclinado mancuernas","pecho_superior","tríceps:.5,deltoide_anterior:.5","empuje_inclinado","compuesto"],
["press-maquina-convergente","Press máquina convergente","pecho","tríceps:.4,deltoide_anterior:.25","empuje_horizontal","compuesto"],
["press-maquina-neutro","Press máquina neutro","pecho","tríceps:.4,deltoide_anterior:.25","empuje_horizontal","compuesto"],
["fondos","Fondos","pecho","tríceps:.6,deltoide_anterior:.25","empuje_vertical","compuesto"],
["fondos-asistidos","Fondos asistidos","pecho","tríceps:.6,deltoide_anterior:.25","empuje_vertical","compuesto"],
["aperturas-mancuernas","Aperturas mancuernas","pecho","","aduccion_horizontal","aislamiento"],
["pec-deck","Pec deck","pecho","","aduccion_horizontal","aislamiento"],
["cruce-poleas","Cruce de poleas","pecho","","aduccion_horizontal","aislamiento"],
["dominadas","Dominadas","espalda/dorsal","bíceps:.5,braquial:.25","traccion_vertical","compuesto"],
["dominadas-lastradas","Dominadas lastradas","espalda/dorsal","bíceps:.5,braquial:.25","traccion_vertical","fuerza"],
["chin-up","Chin-up","espalda/dorsal","bíceps:.6,braquial:.3","traccion_vertical","compuesto"],
["jalon-neutro","Jalón neutro","espalda/dorsal","bíceps:.45,braquial:.25","traccion_vertical","compuesto"],
["jalon-supino","Jalón supino","espalda/dorsal","bíceps:.6,braquial:.3","traccion_vertical","compuesto"],
["jalon-unilateral","Jalón unilateral","espalda/dorsal","bíceps:.4","traccion_vertical","compuesto"],
["remo-pecho-apoyado","Remo pecho apoyado","espalda/dorsal","bíceps:.5,deltoide_posterior:.25","traccion_horizontal","compuesto"],
["remo-hammer","Remo Hammer","espalda/dorsal","bíceps:.5,deltoide_posterior:.25","traccion_horizontal","compuesto"],
["remo-polea","Remo polea","espalda/dorsal","bíceps:.5,deltoide_posterior:.25","traccion_horizontal","compuesto"],
["remo-unilateral","Remo unilateral","espalda/dorsal","bíceps:.5,deltoide_posterior:.25","traccion_horizontal","compuesto"],
["remo-maquina","Remo máquina","espalda/dorsal","bíceps:.5,deltoide_posterior:.25","traccion_horizontal","compuesto"],
["elevacion-lateral","Elevación lateral","deltoide_lateral","","abduccion_hombro","aislamiento"],
["elevacion-lateral-polea","Elevación lateral polea","deltoide_lateral","","abduccion_hombro","aislamiento"],
["elevacion-lateral-unilateral","Elevación lateral unilateral","deltoide_lateral","","abduccion_hombro","aislamiento"],
["reverse-pec-deck","Reverse pec deck","deltoide_posterior","espalda/dorsal:.2","abduccion_horizontal","aislamiento"],
["pajarito","Pajarito","deltoide_posterior","espalda/dorsal:.2","abduccion_horizontal","aislamiento"],
["face-pull","Face pull","deltoide_posterior","escapula:.5","traccion_horizontal","correctivo"],
["press-militar","Press militar","deltoide_anterior","tríceps:.5,deltoide_lateral:.35","empuje_vertical","fuerza"],
["press-mancuernas-hombro","Press mancuernas","deltoide_anterior","tríceps:.5,deltoide_lateral:.35","empuje_vertical","compuesto"],
["press-maquina-hombro","Press máquina","deltoide_anterior","tríceps:.5,deltoide_lateral:.35","empuje_vertical","compuesto"],
["curl-barra","Curl barra","bíceps","braquial:.35","flexion_codo","aislamiento"],
["curl-ez","Curl EZ","bíceps","braquial:.35","flexion_codo","aislamiento"],
["curl-mancuernas","Curl mancuernas","bíceps","braquial:.35","flexion_codo","aislamiento"],
["curl-inclinado","Curl inclinado","bíceps","braquial:.3","flexion_codo","aislamiento"],
["curl-martillo","Curl martillo","braquial","bíceps:.75,antebrazo:.35","flexion_codo","aislamiento"],
["curl-predicador","Curl predicador","bíceps","braquial:.3","flexion_codo","aislamiento"],
["curl-polea","Curl polea","bíceps","braquial:.3","flexion_codo","aislamiento"],
["curl-unilateral","Curl unilateral","bíceps","braquial:.3","flexion_codo","aislamiento"],
["curl-bayesian","Curl Bayesian","bíceps","braquial:.3","flexion_codo","aislamiento"],
["pushdown","Pushdown","tríceps","","extension_codo","aislamiento"],
["pushdown-cuerda","Pushdown cuerda","tríceps","","extension_codo","aislamiento"],
["pushdown-barra","Pushdown barra","tríceps","","extension_codo","aislamiento"],
["extension-sobre-cabeza","Extensión sobre cabeza","tríceps","","extension_codo","aislamiento"],
["extension-unilateral","Extensión unilateral","tríceps","","extension_codo","aislamiento"],
["rompecraneos","Rompecráneos","tríceps","","extension_codo","aislamiento"],
["press-frances","Press francés","tríceps","","extension_codo","aislamiento"],
["extension-polea","Extensión en polea","tríceps","","extension_codo","aislamiento"],
["sentadilla","Sentadilla","cuádriceps","glúteo:.5,erectores:.25","sentadilla","compuesto"],
["sentadilla-alta","Sentadilla alta","cuádriceps","glúteo:.5,erectores:.25","sentadilla","fuerza"],
["sentadilla-pausada","Sentadilla pausada","cuádriceps","glúteo:.5,erectores:.25","sentadilla","fuerza"],
["hack-squat","Hack squat","cuádriceps","glúteo:.4","sentadilla","compuesto"],
["prensa","Prensa","cuádriceps","glúteo:.45","empuje_pierna","compuesto"],
["bulgarian-split-squat","Bulgarian split squat","cuádriceps","glúteo:.75","unilateral_pierna","compuesto"],
["step-up","Step-up","cuádriceps","glúteo:.75","unilateral_pierna","compuesto"],
["extension-rodilla","Extensión de rodilla","cuádriceps","","extension_rodilla","aislamiento"],
["belt-squat","Belt squat","cuádriceps","glúteo:.4","sentadilla","compuesto"],
["rdl","RDL","isquios","glúteo:.75,erectores:.25","bisagra","compuesto"],
["peso-muerto-rumano","Peso muerto rumano","isquios","glúteo:.75,erectores:.25","bisagra","compuesto"],
["curl-femoral-sentado","Curl femoral sentado","isquios","","flexion_rodilla","aislamiento"],
["curl-femoral-acostado","Curl femoral acostado","isquios","","flexion_rodilla","aislamiento"],
["nordic-curl","Nordic curl","isquios","","flexion_rodilla","fuerza"],
["good-morning","Good morning","isquios","glúteo:.6,erectores:.5","bisagra","compuesto"],
["back-extension-sesgada","Back extension sesgada","isquios","glúteo:.7,erectores:.35","bisagra","accesorio"],
["hip-thrust","Hip thrust","glúteo","isquios:.25","extension_cadera","compuesto"],
["glute-bridge","Glute bridge","glúteo","isquios:.2","extension_cadera","accesorio"],
["zancadas","Zancadas","glúteo","cuádriceps:.75","unilateral_pierna","compuesto"],
["kickback","Kickback","glúteo","","extension_cadera","aislamiento"],
["abduccion","Abducción","glúteo","abductores:.75","abduccion_cadera","aislamiento"],
["gemelo-de-pie","Gemelo de pie","gemelos","","flexion_plantar","aislamiento"],
["gemelo-sentado","Gemelo sentado","gemelos","","flexion_plantar","aislamiento"],
["gemelo-prensa","Gemelo en prensa","gemelos","","flexion_plantar","aislamiento"],
["soleus-raise","Soleus raise","gemelos","","flexion_plantar","aislamiento"],
["crunch","Crunch","core","","flexion_tronco","aislamiento"],
["cable-crunch","Cable crunch","core","","flexion_tronco","aislamiento"],
["elevacion-piernas","Elevación de piernas","core","","flexion_cadera","control"],
["hanging-leg-raise","Hanging leg raise","core","","flexion_cadera","control"],
["ab-wheel","Ab wheel","core","","anti-extension","control"],
["pallof-press","Pallof press","core","","anti-rotacion","control"],
["dead-bug","Dead bug","core","","anti-extension","correctivo"],
["hollow-hold","Hollow hold","core","","anti-extension","control"],
["plank","Plank","core","","anti-extension","control"],
["side-plank","Side plank","core","abductores:.25","anti-inclinacion","control"],
["farmer-carry","Farmer carry","core","antebrazo:.5,trapecio:.35","carry","control"],
["suitcase-carry","Suitcase carry","core","antebrazo:.5,oblicuos:.5","carry","control"],
["encogimientos","Encogimientos","trapecio","","elevacion_escapula","aislamiento"],
["curl-muneca","Curl de muñeca","antebrazo","","flexion_muneca","aislamiento"],
["ext-muneca","Extensión de muñeca","antebrazo","","extension_muneca","aislamiento"],
["rotacion-externa","Rotación externa","manguito_rotador","","rotacion_hombro","correctivo"],
["scap-pullup","Scap pull-up","escapula","espalda/dorsal:.25","depresion_escapula","correctivo"]
];

const V10_ALIAS = {
  "press-banca":["bench press","banca plana","press plano"],"press-banca-pausado":["bench pausado","press banca pause","press banca con pausa"],
  "press-inclinado-mancuernas":["incline db","press inclinado db"],"dominadas":["pull ups","pull-up","pullups","dominadas bw"],
  "dominadas-lastradas":["pull ups lastradas","pull-ups lastradas","dominada lastrada"],"chin-up":["chin ups","chinups"],
  "remo-hammer":["hammer row"],"sentadilla-alta":["high bar squat","high squat","sentadilla high bar"],
  "rdl":["peso muerto rumano","rumano","romanian deadlift"],"hip-thrust":["hip thrust","hip thrust barra"],
  "bulgarian-split-squat":["bulgarian","split squat","búlgaras"],"curl-femoral-sentado":["curl femoral","seated leg curl"],
  "elevacion-lateral":["laterales","elevaciones laterales","lateral raises"],"press-militar":["militar","overhead press","ohp"]
};

const V10_CATALOG = Object.fromEntries(V10_EXERCISE_DEFS.map(([id,name,primary,secondary,pattern,category])=>{
  const secondaries=(secondary?secondary.split(",").filter(Boolean):[]).map(x=>{const [muscle,w]=x.split(":");return {muscle,weight:Number(w)};});
  const weights=Object.fromEntries([[primary,1],...secondaries.map(x=>[x.muscle,x.weight])]);
  return [id,{id,name,aliases:[name,...(V10_ALIAS[id]||[])],sourceMuscle:primary,primaryMuscles:[primary],secondaryMuscles:secondaries,volumeWeights:weights,movementPattern:pattern,category,equipment:"variable",goalModes:["strength","hypertrophy","mixed"],unilateral:false,bilateral:true,repRange:category==="fuerza"?"1-6":category==="aislamiento"?"8-20":"5-15",recommendedRIR:category==="fuerza"?"2-4":"1-3",countsAsVolume:!["cardio","correctivo","control"].includes(category),warmup:false,accessory:!["compuesto","fuerza"].includes(category),compound:["compuesto","fuerza"].includes(category),isolation:category==="aislamiento"}];
}));

function v10Key(s){return stripAccents(String(s||"").toLowerCase()).replace(/[^a-z0-9áéíóúüñ]+/g," ").trim().replace(/\s+/g," ");}
function v10ExerciseId(name){
  const s=v10Key(name);
  for(const e of Object.values(V10_CATALOG)) if(v10Key(e.name)===s || e.aliases.some(a=>v10Key(a)===s)) return e.id;
  return Object.keys(V10_ALIAS).find(id=>id===s || (V10_ALIAS[id]||[]).some(a=>v10Key(a)===s)) || null;
}
function v10ExerciseMeta(name){const id=v10ExerciseId(name);return id?V10_CATALOG[id]:null;}

if(typeof module!=="undefined") module.exports={V10_CATALOG,V10_ALIAS,v10ExerciseId,v10ExerciseMeta};
