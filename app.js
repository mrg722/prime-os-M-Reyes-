const STORAGE_KEY = "prime_os_martin_v7_3";
const LEGACY_KEYS = ["prime_os_martin_v7_2", "prime_os_martin_v7_1", "prime_os_martin_v7", "prime_os_martin_v6_3", "prime_os_martin_v6_2", "prime_os_martin_v6_visual", "prime_os_martin_v5", "prime_os_martin_v4", "prime_os_martin_v3", "prime_os_v1", "forgelog_martin_v2", "forgelog_martin_v1"];

const MUSCLE_GROUPS = ["cuádriceps","glúteo","isquios","posterior/hinge","pecho","espalda/dorsal","deltoide lateral","bíceps","tríceps","gemelos","core/control","escápula/manguito","cardio","recuperación","general"];

const seedData = {
  settings: {
    ownerName: "Martin Reyes",
    goalWeight: "75-76 kg",
    mainGoal: "Recomposición + fuerza",
    deadliftWeakness: "Bloqueo final",
    sensitiveExercises: "Banca plana pesada, sentadilla si molesta cervical, trote fuerte con isquio sensible"
  },
  selectedWeek: "Semana 1",
  selectedDay: "Miércoles - Upper A",
  weeks: ["Semana 1","Semana 2","Semana 2.5 Pivot","Semana 3","Semana 4","Semana 5","Semana 6"],
  days: ["Lunes - Descanso","Martes - Lower A","Miércoles - Upper A","Jueves - Cardio suave","Viernes - Lower B","Sábado - Upper B","Domingo - Trote opcional"],
  routine: {},
  sessions: [],
  weeklyTargets: {},
  cardio: [
    {date:"Registro previo", type:"Trote calle", distance:"4.12 km", pace:"4:46/km", time:"19:40", feeling:"Fuerte"},
    {date:"Registro previo", type:"Cinta", distance:"7 km", pace:"11.1→13.3 km/h", time:"—", feeling:"Controlado"},
    {date:"Registro previo", type:"Spinning", distance:"—", pace:"—", time:"1 h", feeling:"Zona cardio"}
  ],
  weightLog: [
    {date:"", week:"Histórico", avg:"77.4", min:"77.0", max:"78.5", waist:"", notes:"Etapa previa. Peso histórico 77.4-78.5 kg."},
    {date:"", week:"Posterior", avg:"74.5", min:"74", max:"75", waist:"", notes:"Etapa posterior indicada: 74-75 kg."}
  ],
  ui: { sidebarCompact: false },

  blockStatus: {
    "Semana 1": {status:"base", note:"Base cargada con referencias previas."},
    "Semana 2": {status:"base", note:"Base editable según registros previos."},
    "Semana 2.5 Pivot": {status:"real", note:"Registros reales cargados: Lower A, Upper A y Lower B. Sin Upper B ni trote."},
    "Semana 3": {status:"base", note:"Semana de retorno ordenado. Cuidar hombro."},
    "Semana 4": {status:"base", note:"Progresión moderada."},
    "Semana 5": {status:"base", note:"Intensificación controlada."},
    "Semana 6": {status:"base", note:"Cierre/test técnico si todo está verde."}
  },
  prs: {
    "Peso muerto sumo": "210 kg x3, fallo cerca del bloqueo en 3ª",
    "Press banca": "125 kg single histórico, 115x5 @7, 120x3 con 4ª fallida",
    "Sentadilla alta": "155x4 reciente, meta previa 170x4",
    "Dominadas lastradas": "30 kg x8/7/6, previo 27.5x8x2 + 20x9",
    "Press inclinado mancuernas": "40 kg x5 RIR1; 35 kg x7 RIR1"
  }
};


function martinSeedSessions(){
  return [
    {
      id: 250001,
      date: "Semana 2.5",
      week: "Semana 2.5 Pivot",
      day: "Martes - Lower A",
      readiness: {status:"Importado", sleep:"", energy:"", shoulder:"", neck:"", ham:"", motivation:""},
      notes: "Cuádriceps controlado. Progreso limpio sin castigar lumbar ni repetir fallo cardiaco.",
      exercises: [
        {
          name:"Búlgara",
          muscle:"cuádriceps",
          target:"RIR 2-3",
          actualSets:2,
          isAdded:false,
          isAlternative:false,
          note:"Bajar un poco por lumbar. No repetir fallo cardiaco.",
          sets:[
            {set:1, weight:"27,5 kg por mano", repsDone:"10 por pierna", rir:"RIR 3-4", feeling:"controlado", rest:"2-3 min", pain:"0", done:true},
            {set:2, weight:"27,5 kg por mano", repsDone:"10 por pierna", rir:"RIR 3", feeling:"controlado", rest:"2-3 min", pain:"0", done:true}
          ]
        },
        {
          name:"Prensa 45",
          muscle:"cuádriceps",
          target:"RIR 2",
          actualSets:2,
          isAdded:false,
          isAlternative:false,
          note:"No pasar de 240 si se siente pesada. Sin manos ayudando.",
          sets:[
            {set:1, weight:"230 kg", repsDone:"10", rir:"RIR 2-3", feeling:"sólida", rest:"3-4 min", pain:"0", done:true},
            {set:2, weight:"230 kg", repsDone:"10", rir:"RIR 1-2", feeling:"más pesada", rest:"3-4 min", pain:"0", done:true}
          ]
        },
        {
          name:"Sóleo sentado + gemelos de pie",
          muscle:"cuádriceps",
          target:"RIR 1-2",
          actualSets:2,
          isAdded:true,
          isAlternative:true,
          note:"40 kg sentado + de pie con peso corporal.",
          sets:[
            {set:1, weight:"40 kg + peso corporal", repsDone:"20 sentado + 21 de pie", rir:"", feeling:"controlado", rest:"60-90 s", pain:"0", done:true},
            {set:2, weight:"40 kg + peso corporal", repsDone:"similar S1", rir:"", feeling:"controlado", rest:"60-90 s", pain:"0", done:true}
          ]
        },
        {
          name:"Extensión cuádriceps",
          muscle:"cuádriceps",
          target:"RIR 1-2",
          actualSets:3,
          isAdded:false,
          isAlternative:false,
          note:"Lento y controlado. Rodilla manda.",
          sets:[
            {set:1, weight:"115 kg", repsDone:"15", rir:"@6 fácil", feeling:"fácil", rest:"90 s", pain:"0", done:true},
            {set:2, weight:"115 kg", repsDone:"15", rir:"", feeling:"controlado", rest:"90 s", pain:"0", done:true},
            {set:3, weight:"115 kg", repsDone:"15", rir:"", feeling:"controlado", rest:"90 s", pain:"0", done:true}
          ]
        }
      ]
    },
    {
      id: 250002,
      date: "Semana 2.5",
      week: "Semana 2.5 Pivot",
      day: "Miércoles - Upper A",
      readiness: {status:"Precaución", sleep:"PM/sueño", energy:"", shoulder:"6", neck:"", ham:"", motivation:""},
      notes: "Entreno PM con sueño. Dolor 6/10 en press inclinado. Evitar RIR 0 en Semana 3.",
      exercises: [
        {
          name:"Press inclinado mancuernas",
          muscle:"pecho",
          target:"RIR 2",
          actualSets:2,
          isAdded:false,
          isAlternative:false,
          note:"Dolor 6/10. No repetir agresivo si hombro/pecho molesta.",
          sets:[
            {set:1, weight:"75 lbs", repsDone:"9", rir:"RIR 1", feeling:"pesado", rest:"3 min", pain:"6", done:true},
            {set:2, weight:"75 lbs", repsDone:"7", rir:"RIR 1", feeling:"pesado", rest:"3 min", pain:"6", done:true}
          ]
        },
        {
          name:"Pulldown",
          muscle:"espalda/dorsal",
          target:"RIR 2",
          actualSets:3,
          isAdded:true,
          isAlternative:true,
          note:"Reemplazo/variación de dominadas.",
          sets:[
            {set:1, weight:"96 kg", repsDone:"8", rir:"", feeling:"fuerte", rest:"2-3 min", pain:"0", done:true},
            {set:2, weight:"82 kg", repsDone:"10", rir:"RIR 1", feeling:"controlado", rest:"2-3 min", pain:"0", done:true},
            {set:3, weight:"82 kg", repsDone:"8", rir:"RIR 3", feeling:"controlado", rest:"2-3 min", pain:"0", done:true}
          ]
        },
        {
          name:"Pushdown tríceps",
          muscle:"tríceps",
          target:"RIR 1-2",
          actualSets:2,
          isAdded:false,
          isAlternative:false,
          note:"Una serie llegó a RIR 0. Controlar.",
          sets:[
            {set:1, weight:"80 lbs", repsDone:"11", rir:"RIR 0", feeling:"al límite", rest:"90 s", pain:"0", done:true},
            {set:2, weight:"65 lbs", repsDone:"15", rir:"RIR 2", feeling:"mejor", rest:"90 s", pain:"0", done:true}
          ]
        }
      ]
    },
    {
      id: 250003,
      date: "Semana 2.5",
      week: "Semana 2.5 Pivot",
      day: "Viernes - Lower B",
      readiness: {status:"Importado", sleep:"", energy:"", shoulder:"", neck:"", ham:"", motivation:""},
      notes: "Día sin tiempo. Solo dos ejercicios ejecutados. Sin hip thrust, prensa pies altos, gemelos ni core.",
      exercises: [
        {
          name:"Peso muerto semi sumo",
          muscle:"posterior/hinge",
          target:"RIR 2-3",
          actualSets:2,
          isAdded:true,
          isAlternative:true,
          note:"Hinge único y controlado. No subir a 145 todavía.",
          sets:[
            {set:1, weight:"130 kg", repsDone:"8", rir:"RIR 3", feeling:"técnico", rest:"3 min", pain:"0", done:true},
            {set:2, weight:"130 kg", repsDone:"8", rir:"RIR 3", feeling:"técnico", rest:"3 min", pain:"0", done:true}
          ]
        },
        {
          name:"Curl femoral",
          muscle:"isquio",
          target:"RIR 1-2",
          actualSets:3,
          isAdded:false,
          isAlternative:false,
          note:"Mucho RIR. Sesión corta.",
          sets:[
            {set:1, weight:"60 lbs", repsDone:"20", rir:"muchos", feeling:"fácil", rest:"2 min", pain:"0", done:true},
            {set:2, weight:"80 lbs", repsDone:"15", rir:"muchos", feeling:"fácil", rest:"2 min", pain:"0", done:true},
            {set:3, weight:"80 lbs", repsDone:"15", rir:"muchos", feeling:"fácil", rest:"2 min", pain:"0", done:true}
          ]
        }
      ]
    }
  ];
}

function martinWeek25Routine(){
  return {
    "Lunes - Descanso": [
      ex("Movilidad + caminata suave", 1, "15-25 min", "—", "Suave", "recuperación", "Pivot/deload: baja 30-40% volumen, sin fallo"),
      ex("Chequeo molestias", 1, "0-10", "—", "Honesto", "recuperación", "Registrar hombro, cuello, lumbar, isquio")
    ],
    "Martes - Lower A": [
      ex("Prensa 45 / máquina disponible", 3, "Top 6-8 / Back 8-10", "Top 230-240 kg / Back 210-225 kg", "RIR 2", "pierna", "No pasar de 240 si se siente pesada. Sin manos ayudando."),
      ex("Búlgara", 2, "8-10 por pierna", "26-30 kg por mano", "RIR 2-3", "pierna", "Bajar un poco por lumbar. No repetir fallo cardiaco."),
      ex("Extensión cuádriceps", 3, "12-15", "150-165 lbs", "RIR 1-2", "pierna", "Pausa 1 s arriba. Rodilla manda."),
      ex("Gemelos", 3, "10-15", "Moderado", "RIR 1-2", "pierna", "No forzar si aparecen calambres. Descanso real."),
      ex("Core anti-extensión", 2, "8-12 o 15-20 s", "Suave", "Técnico", "core", "Calidad antes que carga. No fatigar para Lower B.")
    ],
    "Miércoles - Upper A": [
      ex("Press inclinado manc.", 3, "Top 6-8 / Back 8-10", "Top 38-40 kg / Back 34-35 kg", "RIR 2", "pecho", "Si la top queda RIR 1, backoffs RIR 2-3. Nada de RIR 0."),
      ex("Dominadas lastradas", 3, "Top 5-7 / Back 6-8", "Top +22.5 a +25 kg / Back +15-20 kg", "RIR 2", "espalda", "Barbilla limpia. No grind."),
      ex("Remo frontal / pecho apoyado", 3, "8-12", "75-80 kg", "RIR 2", "espalda", "Dorsal antes que agarre. Pausa 1 s atrás si fácil."),
      ex("Press plano barra o máquina", 2, "8-10", "65-70 kg o moderado", "RIR 2", "pecho", "Volumen limpio. Sin batalla."),
      ex("Pushdown tríceps", 2, "10-15", "Carga que no lleve a RIR 0", "RIR 1-2", "tríceps", "No bloquear violento. Tensión continua."),
      ex("Curl bíceps polea/curl", 2, "10-15", "Controlado", "RIR 1-2", "bíceps", "Ajustar para 10-15 reps."),
      ex("Circuito escapular", 1, "5-8 min", "Ligero", "Técnico", "hombro", "No saltar. Salud de hombro.")
    ],
    "Jueves - Cardio suave": [
      ex("Zona 2", 1, "25-40 min", "—", "Suave", "cardio", "Respiración controlada"),
      ex("Movilidad cadera/isquio", 1, "10-15 min", "—", "Suave", "recuperación", "No estirar agresivo si hay tirón")
    ],
    "Viernes - Lower B": [
      ex("RDL principal o semi-sumo técnico", 3, "6-8", "130-135 kg", "RIR 2-3", "posterior", "No subir a 145 todavía. Si lumbar cargada, 120-130."),
      ex("Hip Thrust", 3, "8-10", "155-165 kg", "RIR 2", "glúteo", "Pausa 1 s arriba. Glúteo, no lumbar."),
      ex("Curl femoral", 3, "10-12", "90-105 lbs", "RIR 1-2", "isquio", "Excéntrica controlada. Sin rest-pause."),
      ex("Prensa pies altos", 2, "10-12", "180-210 kg", "RIR 2", "posterior", "Solo si lumbar está bien. Control y tensión."),
      ex("Gemelos", 3, "12-20", "Moderado", "RIR 1-2", "pierna", "Evitar calambre: descanso 90 s si hace falta."),
      ex("Core/carry opcional", 2, "20-30 s", "Suave", "Técnico", "core", "Solo si estás verde.")
    ],
    "Sábado - Upper B": [
      ex("Upper B no ejecutado", 1, "—", "—", "—", "recuperación", "Semana 2.5 sin Upper B.")
    ],
    "Domingo - Trote opcional": [
      ex("Trote no ejecutado", 1, "—", "—", "—", "cardio", "Semana 2.5 sin trote.")
    ]
  };
}


function martinTargetsForWeek(week){
  const map = {
    "Semana 1": {"cuádriceps":9, "glúteo":7, "isquios":7, "posterior/hinge":3, "pecho":8, "espalda/dorsal":10, "deltoide lateral":3, "bíceps":4, "tríceps":4, "gemelos":6, "core/control":4, "escápula/manguito":2, "cardio":1, "recuperación":2, "general":0},
    "Semana 2": {"cuádriceps":10, "glúteo":8, "isquios":8, "posterior/hinge":3, "pecho":9, "espalda/dorsal":11, "deltoide lateral":4, "bíceps":5, "tríceps":5, "gemelos":6, "core/control":5, "escápula/manguito":3, "cardio":1, "recuperación":2, "general":0},
    "Semana 2.5 Pivot": {"cuádriceps":7, "glúteo":5, "isquios":4, "posterior/hinge":3, "pecho":5, "espalda/dorsal":6, "deltoide lateral":2, "bíceps":2, "tríceps":3, "gemelos":4, "core/control":3, "escápula/manguito":2, "cardio":1, "recuperación":3, "general":0},
    "Semana 3": {"cuádriceps":11, "glúteo":10, "isquios":9, "posterior/hinge":3, "pecho":10, "espalda/dorsal":13, "deltoide lateral":5, "bíceps":6, "tríceps":6, "gemelos":7, "core/control":6, "escápula/manguito":3, "cardio":2, "recuperación":2, "general":0},
    "Semana 4": {"cuádriceps":11, "glúteo":10, "isquios":9, "posterior/hinge":3, "pecho":10, "espalda/dorsal":13, "deltoide lateral":5, "bíceps":6, "tríceps":6, "gemelos":7, "core/control":6, "escápula/manguito":3, "cardio":2, "recuperación":2, "general":0},
    "Semana 5": {"cuádriceps":10, "glúteo":9, "isquios":8, "posterior/hinge":3, "pecho":9, "espalda/dorsal":11, "deltoide lateral":4, "bíceps":5, "tríceps":5, "gemelos":6, "core/control":5, "escápula/manguito":2, "cardio":1, "recuperación":2, "general":0},
    "Semana 6": {"cuádriceps":6, "glúteo":6, "isquios":5, "posterior/hinge":2, "pecho":5, "espalda/dorsal":7, "deltoide lateral":2, "bíceps":3, "tríceps":3, "gemelos":4, "core/control":4, "escápula/manguito":2, "cardio":1, "recuperación":4, "general":0}
  };
  return map[week] || map["Semana 3"];
}

function martinPlanForWeek(week){
  const cfg = {
    "Semana 1": {
      name:"Reentrada técnica / resensibilización",
      rir:"RIR 2-3",
      lowerA:["230-240 kg top / 210-220 kg back","26-30 kg c/mano","150-170 lbs"],
      upperA:["+20-25 kg","34-36 kg top / 30-32 kg back","65-75 kg"],
      lowerB:["120-130 kg","150-160 kg","180-210 kg"],
      upperB:["30-34 kg","170-190 lbs o BW","7.5-10 kg"],
      note:"No PR, no fallo, no extras. Salir con energía."
    },
    "Semana 2": {
      name:"Acumulación efectiva",
      rir:"RIR 2 / accesorios 1-2",
      lowerA:["240-250 kg top / 220-230 kg back","30-32 kg c/mano","160-180 lbs"],
      upperA:["+25-27.5 kg","36-38 kg top / 32-34 kg back","70-80 kg"],
      lowerB:["130-135 kg","160-170 kg","200-220 kg"],
      upperB:["32-36 kg","180-195 lbs o BW","7.5-10 kg"],
      note:"Progresar solo si Semana 1 fue verde."
    },
    "Semana 3": {
      name:"Intensificación I",
      rir:"RIR 1-2",
      lowerA:["250-260 kg top / 230-240 kg back","32-34 kg c/mano","170-190 lbs"],
      upperA:["+27.5-30 kg","38-40 kg top / 34-36 kg back","75-85 kg"],
      lowerB:["RDL 135-145 kg o DL 170-180 si verde","170-180 kg","210-230 kg"],
      upperB:["34-38 kg","190-205 lbs o BW","10-12.5 kg"],
      note:"Top sets más serios, sin convertir todo en fallo."
    },
    "Semana 4": {
      name:"Intensificación II",
      rir:"RIR 1",
      lowerA:["260-270 kg top / 240-250 kg back","34-36 kg c/mano","180-200 lbs"],
      upperA:["+30 kg top","40 kg top / 36-38 kg back","80-85 kg"],
      lowerB:["RDL 140-145 kg o DL 175-185 si verde","175-185 kg","220-240 kg"],
      upperB:["36-38 kg","195-210 lbs o BW","10-12.5 kg"],
      note:"Consolidar pesos altos sin agregar volumen basura."
    },
    "Semana 5": {
      name:"Pico técnico controlado",
      rir:"RIR 0-1 solo top seguro / resto 1-2",
      lowerA:["270-285 kg top / 250-260 kg back","36-40 kg si técnica limpia","mínimo útil"],
      upperA:["+30-32.5 kg","40 kg rep PR / back 36 kg","mínimo útil"],
      lowerB:["RDL 145-150 o DL 180-190 solo verde","180-190 kg","moderado"],
      upperB:["38-40 kg si estable","200-210 lbs","moderado"],
      note:"Rep PR técnico, no ego PR. Si hay dolor, cancelar pico."
    },
    "Semana 6": {
      name:"Pivot / Deload inteligente",
      rir:"RIR 3-4",
      lowerA:["210-230 kg","20-24 kg c/mano","120-150 lbs"],
      upperA:["BW/+10 o jalón ligero","30-32 kg","60-70 kg"],
      lowerB:["RDL 110-120 o DL técnico 130-150","130-150 kg","ligera"],
      upperB:["26-30 kg","150-170 lbs","5-7.5 kg"],
      note:"Bajar volumen 40-50%. Salir fresco."
    }
  }[week];

  if(week === "Semana 2.5 Pivot") return martinWeek25Routine();
  if(!cfg) return martinPlanForWeek("Semana 3");

  const pivot = week === "Semana 6";
  return {
    "Lunes - Descanso": [
      ex("Movilidad + caminata", 1, "15-25 min", "—", "Suave", "recuperación", `${cfg.name}. ${cfg.note}`),
      ex("Chequeo molestias", 1, "0-10", "—", "Honesto", "recuperación", "Registrar hombro, cuello/lumbar, isquio, energía y sueño.")
    ],
    "Martes - Lower A": [
      ex("Prensa 45 top/backoff", pivot ? 2 : 3, "Top 6-8 / Back 8-10", cfg.lowerA[0], cfg.rir, "cuádriceps", "Profundidad, control, sin manos. Sin back squat por cuello."),
      ex("Variante unilateral / hack / belt / Smith sin cuello", pivot ? 1 : 2, "8-10", "Moderado", cfg.rir, "cuádriceps", "Elegir variante que no cargue cervical."),
      ex("Sentadilla búlgara", pivot ? 1 : 2, "8-10 por pierna", cfg.lowerA[1], cfg.rir, "glúteo", "Control cardiaco, sin fallo técnico."),
      ex("Extensión cuádriceps", pivot ? 2 : 3, "12-15", cfg.lowerA[2], cfg.rir, "cuádriceps", "Pausa 1 s arriba. Rodilla manda."),
      ex("Gemelos", pivot ? 2 : 3, "12-20", "Moderado", "RIR 1-2", "gemelos", "Rango completo y descanso real."),
      ex("Core anti-extensión", pivot ? 2 : 3, "10-15 o 20-40 s", "Moderado", "Técnico", "core/control", "Calidad antes que carga.")
    ],
    "Miércoles - Upper A": [
      ex("Dominadas lastradas / jalón neutro", pivot ? 2 : 3, "Top 5-8 / Back 6-10", cfg.upperA[0], cfg.rir, "espalda/dorsal", "Barbilla limpia. Si codo/agarre molesta, jalón neutro."),
      ex("Press inclinado mancuernas top/backoff", pivot ? 2 : 3, "Top 6-8 / Back 8-10", cfg.upperA[1], cfg.rir, "pecho", "Hombro protegido. No pelear dolor."),
      ex("Remo pecho apoyado / Hammer", pivot ? 2 : 3, "8-12", cfg.upperA[2], cfg.rir, "espalda/dorsal", "Dorsal antes que agarre. Pausa atrás."),
      ex("Press plano máquina neutro", pivot ? 1 : 2, "8-10", "Moderado", cfg.rir, "pecho", "Volumen limpio, sin grind."),
      ex("Pushdown tríceps", pivot ? 1 : 2, "10-15", "Moderado", "RIR 1-2", "tríceps", "Sin bloqueo violento."),
      ex("Curl bíceps", pivot ? 1 : 2, "10-15", "Controlado", "RIR 1-2", "bíceps", "Codo estable."),
      ex("Circuito escapular", 1, "5-8 min", "Ligero", "Técnico", "escápula/manguito", "No saltar. Salud de hombro.")
    ],
    "Jueves - Cardio suave": [
      ex("Zona 2 / trote suave", 1, "25-40 min", "—", "Suave", "cardio", "No convertirlo en test."),
      ex("Movilidad cadera/isquio", 1, "10-15 min", "—", "Suave", "recuperación", "Preparar Lower B.")
    ],
    "Viernes - Lower B": [
      ex("RDL principal / deadlift técnico solo si verde", pivot ? 2 : 3, week === "Semana 5" ? "1-8 según variante" : "6-8", cfg.lowerB[0], cfg.rir, "posterior/hinge", "Una sola bisagra principal. No sumar RDL + DL pesados."),
      ex("Hip thrust", pivot ? 2 : 3, week === "Semana 5" ? "6-8" : "8-10", cfg.lowerB[1], cfg.rir, "glúteo", "Pausa 1 s arriba. Glúteo, no lumbar."),
      ex("Curl femoral", pivot ? 2 : 3, "10-12", "90-110 lbs / moderado", "RIR 1-2", "isquios", "Excéntrica controlada."),
      ex("Prensa pies altos", pivot ? 1 : 2, "10-12", cfg.lowerB[2], cfg.rir, "glúteo", "Estímulo glúteo/isquio sin otra bisagra pesada."),
      ex("Gemelos", pivot ? 2 : 3, "12-20", "Moderado", "RIR 1-2", "gemelos", "Constancia y rango completo."),
      ex("Core/carry opcional", pivot ? 1 : 2, "20-40 s", "Moderado", "Técnico", "core/control", "Solo si agarre/lumbar están bien.")
    ],
    "Sábado - Upper B": [
      ex("Incline DB Press", pivot ? 2 : 3, "8-10", cfg.upperB[0], cfg.rir, "pecho", "4ta serie solo si estás verde."),
      ex("Jalón neutro / dominadas BW", pivot ? 2 : 3, "8-12", cfg.upperB[1], cfg.rir, "espalda/dorsal", "Control escapular."),
      ex("Remo polea / pecho apoyado", pivot ? 2 : 3, "10-12", "70-85 kg / moderado", cfg.rir, "espalda/dorsal", "Pausa atrás."),
      ex("Elevaciones laterales", pivot ? 1 : 3, "12-18", cfg.upperB[2], "RIR 1-2", "deltoide lateral", "Progresar por calidad, no ego."),
      ex("Curl inclinado / polea", pivot ? 1 : 2, "10-15", "Moderado", "RIR 1-2", "bíceps", "Subir reps antes que peso."),
      ex("Tríceps overhead / pushdown", pivot ? 1 : 2, "10-15", "Moderado", "RIR 1-2", "tríceps", "Fluido, sin bloqueo agresivo."),
      ex("Calistenia técnica", pivot ? 1 : 2, "Submáximo", "Peso corporal", "RIR 3", "core/control", "Soporte paralelas, hollow hold, scap pushups.")
    ],
    "Domingo - Trote opcional": [
      ex("Trote zona 2 / caminata rápida", 1, "20-45 min", "—", "Suave", "cardio", "Opcional. No fuerte si isquio/lumbar sensible."),
      ex("Chequeo semanal", 1, "5 min", "—", "Honesto", "recuperación", "Peso, dolor, fatiga, PRs, energía.")
    ]
  };
}


function ex(name, sets, reps, load, target, muscle, note) {
  return {name, sets:Number(sets)||1, reps, load, target, muscle: normalizeMuscle(muscle), note};
}

function normalizeMuscle(muscle){
  const raw = String(muscle || "general").toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g,"")
    .trim();

  if(raw.includes("cuad") || raw.includes("quad") || raw.includes("pierna")) return "cuádriceps";
  if(raw.includes("glut")) return "glúteo";
  if(raw.includes("isqu") || raw.includes("femoral") || raw.includes("hamstring")) return "isquios";
  if(raw.includes("posterior") || raw.includes("hinge") || raw.includes("rdl") || raw.includes("peso muerto") || raw.includes("bisagra")) return "posterior/hinge";
  if(raw.includes("pecho") || raw.includes("press")) return "pecho";
  if(raw.includes("espalda") || raw.includes("dorsal") || raw.includes("remo") || raw.includes("jalon") || raw.includes("dominada")) return "espalda/dorsal";
  if(raw.includes("deltoide") || raw.includes("hombro") || raw.includes("lateral")) return "deltoide lateral";
  if(raw.includes("biceps") || raw.includes("curl")) return "bíceps";
  if(raw.includes("triceps") || raw.includes("pushdown") || raw.includes("extension")) return "tríceps";
  if(raw.includes("gemelo") || raw.includes("soleo") || raw.includes("calf")) return "gemelos";
  if(raw.includes("core") || raw.includes("control") || raw.includes("ab") || raw.includes("carry")) return "core/control";
  if(raw.includes("escap") || raw.includes("manguito") || raw.includes("rotador")) return "escápula/manguito";
  if(raw.includes("cardio") || raw.includes("trote") || raw.includes("zona")) return "cardio";
  if(raw.includes("recuper") || raw.includes("movilidad") || raw.includes("descanso")) return "recuperación";

  const exact = MUSCLE_GROUPS.find(m => m.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase() === raw);
  return exact || "general";
}

function baseExercises(day, week) {
  const pivot = week.includes("2.5");
  const map = {
    "Lunes - Descanso": [
      ex("Movilidad + caminata suave", "1", "15-25 min", "—", "Suave", "recuperación", "Recuperación activa"),
      ex("Chequeo molestias", "1", "0-10", "—", "Honesto", "recuperación", "Registrar hombro, cervical/lumbar e isquio")
    ],
    "Martes - Lower A": [
      ex("Sentadilla alta", pivot?"2":"4", pivot?"3-5":"4-5", pivot?"110-130 kg":"145-155 kg", pivot?"RPE 6":"RPE 7-8", "pierna", "Cuidar cervical. Si molesta, alternativa: prensa/hack"),
      ex("Sentadilla pausada", pivot?"2":"3", "3-4", pivot?"90-100 kg":"110-120 kg", "RPE 6-7", "pierna", "Pausa 2s, técnica limpia"),
      ex("Prensa o accesorios cuádriceps", pivot?"2":"3", "8-12", "Moderado", "RIR 2-3", "pierna", "No llegar al fallo"),
      ex("Curl femoral", pivot?"2":"3", "8-12", "Moderado", "RIR 2", "isquio", "Si isquio tira, bajar carga")
    ],
    "Miércoles - Upper A": [
      ex("Press inclinado mancuernas", pivot?"2":"3", "6-8", pivot?"30-35 kg":"35-40 kg", "RIR 1-2", "pecho", "Último fuerte: 40x5 RIR1; 35x7 RIR1"),
      ex("Dominadas lastradas", pivot?"2":"3", "6-8", pivot?"20-25 kg":"25-30 kg", "RIR 1-2", "espalda", "Último fuerte: 30x8/7/6"),
      ex("Remo", pivot?"2":"3", "8-10", "Moderado", "RIR 2", "espalda", "Control escapular"),
      ex("Elevaciones laterales", pivot?"2":"3", "12-20", "Ligero", "RIR 2", "hombro", "No irritar hombro"),
      ex("Curl bíceps", pivot?"2":"3", "8-12", "Moderado", "RIR 1-2", "bíceps", "Evitar fallo si estás amarillo"),
      ex("Extensión tríceps", pivot?"2":"3", "8-12", "Moderado", "RIR 1-2", "tríceps", "Evitar fallo si estás amarillo")
    ],
    "Jueves - Cardio suave": [
      ex("Zona 2", "1", "25-40 min", "—", "Suave", "cardio", "Respiración controlada"),
      ex("Movilidad cadera/isquio", "1", "10-15 min", "—", "Suave", "recuperación", "No estirar agresivo si hay tirón")
    ],
    "Viernes - Lower B": [
      ex("Peso muerto sumo", pivot?"2":"4", pivot?"2-3":"3", pivot?"140-160 kg":"180-190 kg", pivot?"RPE 6":"RPE 7-8.5", "posterior", "Punto débil: bloqueo final"),
      ex("Halting deadlift", pivot?"2":"3", "3-4", pivot?"120-130 kg":"145 kg aprox", "RPE 6-7", "posterior", "Pausar antes del bloqueo"),
      ex("Hip thrust o RDL liviano", pivot?"2":"3", "6-10", "Moderado", "RIR 2", "glúteo", "Priorizar glúteo, no lumbar"),
      ex("Core", "2", "8-12", "—", "Control", "core", "Estabilidad")
    ],
    "Sábado - Upper B": [
      ex("Press banca o pausa", pivot?"2":"3", pivot?"3-5":"3-5", pivot?"90-100 kg":"105-115 kg", pivot?"RPE 6":"RPE 7-8", "pecho", "Si hombro molesta, pausa liviana o inclinado"),
      ex("Dominadas/chin ups", pivot?"2":"3", "8-12", "Peso corporal/lastre moderado", "RIR 1-2", "espalda", "Chin ups previos 14/13/11"),
      ex("Press hombro moderado", pivot?"2":"3", "6-10", "Moderado", "RIR 2", "hombro", "Cuidar hombro"),
      ex("Remo horizontal", pivot?"2":"3", "8-12", "Moderado", "RIR 2", "espalda", "Control"),
      ex("Curl bíceps", pivot?"2":"3", "10-15", "Moderado", "RIR 1-2", "bíceps", "Acumular sin destruirte"),
      ex("Tríceps extra", pivot?"2":"3", "10-15", "Moderado", "RIR 1-2", "tríceps", "Acumular sin destruirte")
    ],
    "Domingo - Trote opcional": [
      ex("Trote opcional", "1", "20-45 min", "—", "Según isquio", "cardio", "Si hay isquio sensible, zona 2 o caminar"),
      ex("Chequeo semanal", "1", "5 min", "—", "Honesto", "recuperación", "Anotar peso, dolor, fatiga, PRs")
    ]
  };
  return map[day] || [];
}

let state = loadState();
let trainingDraft = [];
let chartInstance = null;

const PAGE_META = {
  inicio: { title: "Inicio", subtitle: "Panel principal de control y estado actual del bloque." },
  rutina: { title: "Rutina Base", subtitle: "Configura la estructura semanal, ejercicios y planificación del bloque." },
  entrenar: { title: "Registrar", subtitle: "Registra la sesión real, cargas, RIR, dolor y observaciones." },
  historial: { title: "Historial", subtitle: "Revisa sesiones pasadas, ejercicios completados y notas previas." },
  progreso: { title: "Progreso", subtitle: "Analiza objetivos semanales, volumen registrado y tendencias." },
  cardio: { title: "Cardio", subtitle: "Lleva control de trote, zona 2, spinning y trabajo cardiovascular." },
  nutricion: { title: "Peso Corporal", subtitle: "Registra peso corporal y sigue la tendencia semanal o diaria." },
  ajustes: { title: "Ajustes", subtitle: "Administra perfil, almacenamiento local y parámetros del sistema." }
};

function refreshTopMeta(view){
  const meta = PAGE_META[view] || PAGE_META.inicio;
  const title = document.getElementById("pageTitle");
  const sub = document.getElementById("pageSubtitle");
  if(title) title.textContent = meta.title;
  if(sub) sub.textContent = meta.subtitle;
  const goal = document.getElementById("ribbonGoal");
  const weak = document.getElementById("ribbonWeakness");
  if(goal) goal.textContent = state.settings?.mainGoal || "Recomposición + fuerza";
  if(weak) weak.textContent = state.settings?.deadliftWeakness || "Bloqueo final";
}


const $ = sel => document.querySelector(sel);
const $$ = sel => Array.from(document.querySelectorAll(sel));

document.addEventListener("DOMContentLoaded", setup);

function clone(obj){ return JSON.parse(JSON.stringify(obj)); }

function loadState(){
  const direct = localStorage.getItem(STORAGE_KEY);
  if(direct){
    try { return normalizeState(JSON.parse(direct)); } catch(e){}
  }
  for(const key of LEGACY_KEYS){
    const raw = localStorage.getItem(key);
    if(raw){
      try {
        const migrated = normalizeState(JSON.parse(raw));
        localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
        return migrated;
      } catch(e){}
    }
  }
  return normalizeState(clone(seedData));
}

function normalizeState(data){
  const base = clone(seedData);
  data = {...base, ...data};
  data.settings = {...base.settings, ...(data.settings || {})};
  data.weeks = data.weeks?.length ? data.weeks : base.weeks;
  data.days = data.days?.length ? data.days : base.days;
  data.routine = data.routine || {};
  data.sessions = Array.isArray(data.sessions) ? data.sessions : [];
  data.cardio = Array.isArray(data.cardio) ? data.cardio : base.cardio;
  data.weightLog = Array.isArray(data.weightLog) ? data.weightLog : [];
  data.prs = {...base.prs, ...(data.prs || {})};
  data.weeklyTargets = data.weeklyTargets || {};

  data.blockStatus = {...(base.blockStatus || {}), ...(data.blockStatus || {})};

  // Datos específicos confirmados de Martín: plan 6 semanas + Semana 2.5 real.
  if(!data.martinBlockSeeded || data.planVersion !== "v7.3-plan-6-semanas"){
    ["Semana 1","Semana 2","Semana 2.5 Pivot","Semana 3","Semana 4","Semana 5","Semana 6"].forEach(w => {
      data.routine[w] = martinPlanForWeek(w);
      data.weeklyTargets[w] = martinTargetsForWeek(w);
    });

    const existingIds = new Set((data.sessions || []).map(s => s.id));
    martinSeedSessions().forEach(s => {
      if(!existingIds.has(s.id)) data.sessions.push(s);
    });

    data.blockStatus = {
      "Semana 1": {status:"base", note:"Reentrada técnica / resensibilización. RIR 2-3."},
      "Semana 2": {status:"base", note:"Acumulación efectiva. RIR 2."},
      "Semana 2.5 Pivot": {status:"real", note:"Registros reales cargados: Lower A, Upper A y Lower B. Sin Upper B ni trote."},
      "Semana 3": {status:"base", note:"Intensificación I. Top sets serios, sin fallo."},
      "Semana 4": {status:"base", note:"Intensificación II. Consolidar pesos altos."},
      "Semana 5": {status:"base", note:"Pico técnico controlado. PR técnico, no ego PR."},
      "Semana 6": {status:"base", note:"Pivot/deload inteligente. Bajar volumen 40-50%."}
    };

    data.martinBlockSeeded = true;
    data.planVersion = "v7.3-plan-6-semanas";
  }
  data.ui = { sidebarCompact: false, ...(data.ui || {}) };

  data.weeks.forEach(week => {
    if(!data.routine[week]) data.routine[week] = {};
    data.days.forEach(day => {
      if(!Array.isArray(data.routine[week][day])) data.routine[week][day] = baseExercises(day, week);
      data.routine[week][day] = data.routine[week][day].map(e => ({...e, muscle: normalizeMuscle(e.muscle)}));
    });
    if(!data.weeklyTargets[week]) data.weeklyTargets[week] = defaultTargetsFromPlan(data, week);
  });

  data.weightLog = data.weightLog.map((w, i) => ({
    date: w.date || "",
    week: w.week || w.date || `Registro ${i+1}`,
    avg: w.avg || w.weight || "",
    min: w.min || "",
    max: w.max || "",
    waist: w.waist || "",
    notes: w.notes || w.energy || ""
  }));

  data.sessions = data.sessions.map(s => ({
    id: s.id || Date.now() + Math.floor(Math.random()*9999),
    date: s.date || new Date().toLocaleString("es-CL"),
    week: s.week || data.selectedWeek,
    day: s.day || data.selectedDay,
    readiness: s.readiness || {status:"Sin dato"},
    exercises: (s.exercises || []).map(e => ({
      name: e.name || "Ejercicio",
      muscle: normalizeMuscle(e.muscle),
      target: e.target || e.planned?.target || "",
      actualSets: e.actualSets || e.sets?.length || e.planned?.sets || 0,
      isAdded: Boolean(e.isAdded || e.isAlternative),
      isAlternative: Boolean(e.isAdded || e.isAlternative),
      note: e.note || "",
      sets: (e.sets || []).map((set, idx) => ({
        set: set.set || idx+1,
        weight: set.weight || "",
        repsDone: set.repsDone || set.reps || "",
        rir: set.rir || set.rpe || "",
        feeling: set.feeling || "",
        rest: set.rest || "",
        pain: set.pain || "0",
        done: Boolean(set.done || set.weight || set.repsDone || set.reps)
      }))
    })),
    notes: s.notes || ""
  }));

  if(!data.selectedWeek || !data.weeks.includes(data.selectedWeek)) data.selectedWeek = data.weeks[0];
  if(!data.selectedDay || !data.days.includes(data.selectedDay)) data.selectedDay = data.days[2] || data.days[0];
  return data;
}

function defaultTargetsFromPlan(dataObj, week){
  const out = {};
  Object.values(dataObj.routine?.[week] || {}).flat().forEach(e => {
    const m = normalizeMuscle(e.muscle);
    out[m] = (out[m] || 0) + Number(e.sets || 0);
  });
  MUSCLE_GROUPS.forEach(m => { if(out[m] === undefined) out[m] = 0; });
  return out;
}

function saveState(){ localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }

function applySidebarPreference(){
  document.body.classList.toggle("sidebar-compact", Boolean(state.ui?.sidebarCompact));
}

function applyBackgroundForView(view){
  const views = ["inicio","rutina","entrenar","historial","progreso","cardio","nutricion","ajustes"];
  views.forEach(v => document.body.classList.remove("bg-" + v));
  document.body.classList.add("bg-" + (views.includes(view) ? view : "inicio"));
}
function toggleSidebarCompact(){
  if(!state.ui) state.ui = {};
  state.ui.sidebarCompact = !state.ui.sidebarCompact;
  saveState();
  applySidebarPreference();
}

function setup(){
  fillSelectors();
  bindNav();
  bindInputs();
  applySidebarPreference();
  applyBackgroundForView("inicio");
  resetTrainingDraft();
  renderAll();
  refreshTopMeta("inicio");
}

function fillSelectors(){
  const week = $("#weekSelect"), day = $("#daySelect"), exp = $("#exportWeekSelect");
  week.innerHTML = state.weeks.map(w=>`<option ${w===state.selectedWeek?"selected":""}>${escapeHtml(w)}</option>`).join("");
  exp.innerHTML = state.weeks.map(w=>`<option ${w===state.selectedWeek?"selected":""}>${escapeHtml(w)}</option>`).join("");
  day.innerHTML = state.days.map(d=>`<option ${d===state.selectedDay?"selected":""}>${escapeHtml(d)}</option>`).join("");
}

function bindNav(){
  $$(".nav-btn").forEach(btn => btn.addEventListener("click", () => switchView(btn.dataset.view)));
  $$("[data-go]").forEach(btn => btn.addEventListener("click", () => switchView(btn.dataset.go)));
}

function bindInputs(){
  $("#menuBtn")?.addEventListener("click",()=>$("#sidebar").classList.toggle("open"));
  $("#sidebarCompactBtn")?.addEventListener("click", toggleSidebarCompact);
  $("#sidebarTopToggle")?.addEventListener("click", toggleSidebarCompact);
  $("#sidebarCompactBtnMobile")?.addEventListener("click", toggleSidebarCompact);
  $("#weekSelect").addEventListener("change", e => {
    collectDraftInputs();
    state.selectedWeek=e.target.value; $("#exportWeekSelect").value=e.target.value;
    saveState(); resetTrainingDraft(); renderAll();
  });
  $("#daySelect").addEventListener("change", e => {
    collectDraftInputs();
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
  $("#exportJsonBtn")?.addEventListener("click", exportJson);
  $("#exportExcelBtn").addEventListener("click", exportExcel);
  $("#importInput").addEventListener("change", importData);
  $("#weightChartToggle").addEventListener("change", renderChart);
}

function switchView(view){
  collectDraftInputs();
  $$(".nav-btn").forEach(b => b.classList.toggle("active", b.dataset.view===view));
  $$(".view").forEach(v => v.classList.toggle("active", v.id === `view-${view}`));
  refreshTopMeta(view);
  applyBackgroundForView(view);
  $("#sidebar")?.classList.remove("open");
  renderAll();
  if(view === "nutricion") setTimeout(renderChart, 50);
}

function selectedRoutine(){ return state.routine[state.selectedWeek]?.[state.selectedDay] || []; }

function resetTrainingDraft(){
  trainingDraft = selectedRoutine().map(e => ({
    ...clone(e),
    actualSets: Number(e.sets)||3,
    isAdded:false,
    isAlternative:false,
    setsData: Array.from({length:Number(e.sets)||3}, (_,i)=>blankSet(i+1)),
    noteDraft:""
  }));
}

function blankSet(i){ return {set:i, weight:"", repsDone:"", rir:"", feeling:"", rest:"", pain:"0", done:false}; }

function ensureSetsLength(ex){
  const n = Number(ex.actualSets)||1;
  if(!Array.isArray(ex.setsData)) ex.setsData = [];
  while(ex.setsData.length < n) ex.setsData.push(blankSet(ex.setsData.length+1));
  if(ex.setsData.length > n) ex.setsData = ex.setsData.slice(0,n);
  ex.setsData.forEach((s,i)=>s.set=i+1);
}

function collectDraftInputs(){
  if(!document.getElementById("trainingForm")) return;
  trainingDraft.forEach((e,ei)=>{
    const nameInput = document.querySelector(`[data-ei="${ei}"][data-field="name"]`);
    const muscleInput = document.querySelector(`[data-ei="${ei}"][data-field="muscle"]`);
    const repsInput = document.querySelector(`[data-ei="${ei}"][data-field="reps"]`);
    const targetInput = document.querySelector(`[data-ei="${ei}"][data-field="target"]`);
    const loadInput = document.querySelector(`[data-ei="${ei}"][data-field="load"]`);
    const noteInput = document.querySelector(`[data-ei="${ei}"][data-field="note"]`);
    if(nameInput) e.name = nameInput.value;
    if(muscleInput) e.muscle = normalizeMuscle(muscleInput.value);
    if(repsInput) e.reps = repsInput.value;
    if(targetInput) e.target = targetInput.value;
    if(loadInput) e.load = loadInput.value;
    if(noteInput) e.noteDraft = noteInput.value;

    ensureSetsLength(e);
    e.setsData.forEach((s,si)=>{
      ["weight","repsDone","rir","feeling","rest","pain","done"].forEach(field=>{
        const el = document.querySelector(`[data-ei="${ei}"][data-si="${si}"][data-field="${field}"]`);
        if(el){
          s[field] = field === "done" ? el.checked : el.value;
        }
      });
    });
  });
}


function renderBlockStatus(){
  const box = document.getElementById("blockStatusList");
  if(!box) return;
  const weeks = state.weeks || [];
  box.innerHTML = `<div class="block-status-grid">${weeks.map(w => {
    const meta = state.blockStatus?.[w] || {status:"base", note:"Base editable."};
    const sessions = state.sessions.filter(s => s.week === w).length;
    const statusClass = meta.status === "real" ? "status-real" : meta.status === "empty" ? "status-empty" : "status-base";
    const label = meta.status === "real" ? "real" : meta.status === "empty" ? "vacía" : "base";
    return `<div class="status-pill-card">
      <strong>${escapeHtml(w)}</strong>
      <span class="${statusClass}">${label}</span>
      <small>${sessions} sesiones · ${escapeHtml(meta.note || "")}</small>
    </div>`;
  }).join("")}</div>`;
}

function renderAll(){
  renderHome();
  renderRoutine();
  renderTraining();
  renderHistory();
  renderProgress();
  renderCardio();
  renderWeight();
  renderBlockStatus();
  loadSettingsToForm();
  applyOwnerName();
  refreshTopMeta(document.body.className.match(/bg-([a-z]+)/)?.[1] || "inicio");
}

function applyOwnerName(){
  $(".watermark").textContent = `${state.settings.ownerName || "Martin Reyes"} · PRIME OS`.toUpperCase();
}

function renderHome(){
  const dayName = state.selectedDay.split(" - ")[1] || state.selectedDay;
  $("#todayRoutineTitle").textContent = `${dayName} · ${state.selectedWeek}`;
  $("#todaySummary").textContent = selectedRoutine().map(e=>e.name).join(" / ") || "Sin carga de ejercicios planificada.";
  $("#totalSessions").textContent = state.sessions.length;
  $("#weekCompletion").textContent = `${weeklyCompletion(state.selectedWeek)}%`;
  const lastWeight = getLastWeight();
  $("#lastBodyWeight").textContent = lastWeight ? `${lastWeight} kg` : "—";
  renderReadiness();
  $("#homeMuscleBars").innerHTML = muscleBarsHTML(state.selectedWeek);
}

function getLastWeight(){
  const valid = state.weightLog.filter(w => parseNumber(w.avg) !== null);
  if(!valid.length) return null;
  return valid[valid.length-1].avg;
}

function renderReadiness(){
  const sleep = $("#sleepInput").value;
  const energy = Number($("#energyInput").value);
  const shoulder = Number($("#shoulderPainInput").value);
  const neck = Number($("#neckPainInput").value);
  const ham = Number($("#hamPainInput").value);
  const motivation = Number($("#motivationInput").value);
  const maxPain = Math.max(shoulder, neck, ham);

  let status = "green", label = "Óptimo", msg = "Sistema nominal. Progresión habilitada según RIR.";
  if(maxPain >= 5 || energy <= 1){
    status = "red"; label = "Peligro";
    msg = "Alerta estructural. Reducir volumen 30-40%, evitar fallo y usar alternativas seguras.";
  } else if(maxPain >= 3 || sleep === "malo" || energy <= 2 || motivation <= 2){
    status = "yellow"; label = "Precaución";
    msg = "Limitar picos de intensidad. Mantener cargas previas, bajar una serie si hace falta.";
  }

  $("#readinessBadge").className = `badge ${status}`;
  $("#readinessBadge").textContent = label;
  $("#decisionBox").className = `decision ${status}`;
  $("#decisionBox").textContent = msg;
  $("#assistantAdvice").textContent = makeAdvice(status, shoulder, neck, ham);
}

function makeAdvice(status, shoulder, neck, ham){
  const day = state.selectedDay;
  if(status === "red") return "Hoy no busques PR. Haz técnica, movilidad y top sets controlados. Si algo duele más de 5/10, cambia el patrón por un ejercicio agregado seguro.";
  if(day.includes("Upper") && shoulder >= 3) return "Hombro en zona amarilla: mantén press en rango cómodo, sin fallo. Usa Agregar si cambias banca/inclinado por máquina, fondos asistidos o variante sin dolor.";
  if(day.includes("Lower") && neck >= 3) return "Cervical/lumbar sensible: evita sentadilla libre pesada. Agrega prensa, hack o pausa liviana si cambias el patrón.";
  if(day.includes("Lower") && ham >= 3) return "Isquio/glúteo sensible: baja tirones fuertes y evita trote intenso. Prioriza técnica y control.";
  if(day.includes("Lower B")) return "Peso muerto: si el calentamiento está sólido, consolida 180-190 kg sin perder bloqueo. Halting deadlift sigue siendo clave.";
  return "Zona buena: busca igualar o mejorar una repetición respecto a la sesión anterior sin romper técnica ni pasar el RIR objetivo.";
}

function muscleOptions(selected){
  return MUSCLE_GROUPS.map(m=>`<option value="${escapeAttr(m)}" ${normalizeMuscle(selected)===m?"selected":""}>${escapeHtml(m)}</option>`).join("");
}

function renderRoutine(){
  $("#routineList").innerHTML = selectedRoutine().map((e,i) => `
    <div class="exercise-card">
      <div class="exercise-head">
        <div>
          <h4>${escapeHtml(e.name)}</h4>
          <div class="exercise-meta">
            <span class="pill">${Number(e.sets)||0} series</span>
            <span class="pill">${escapeHtml(e.reps)}</span>
            <span class="pill">${escapeHtml(e.load)}</span>
            <span class="pill">${escapeHtml(e.target)}</span>
            <span class="pill">${escapeHtml(e.muscle)}</span>
          </div>
        </div>
        <button class="ghost" onclick="removeExercise(${i})">Eliminar</button>
      </div>
      <div class="form-grid">
        <label>Ejercicio <input value="${escapeAttr(e.name)}" onchange="updateExercise(${i}, 'name', this.value)"></label>
        <label>Músculo
          <select onchange="updateExercise(${i}, 'muscle', this.value)">${muscleOptions(e.muscle)}</select>
        </label>
        <label>Series <input type="number" min="1" max="10" value="${Number(e.sets)||1}" onchange="updateExercise(${i}, 'sets', Number(this.value))"></label>
        <label>Reps <input value="${escapeAttr(e.reps)}" onchange="updateExercise(${i}, 'reps', this.value)"></label>
        <label>Carga <input value="${escapeAttr(e.load)}" onchange="updateExercise(${i}, 'load', this.value)"></label>
        <label>RIR/RPE <input value="${escapeAttr(e.target)}" onchange="updateExercise(${i}, 'target', this.value)"></label>
        <label class="wide">Nota <input value="${escapeAttr(e.note || "")}" onchange="updateExercise(${i}, 'note', this.value)"></label>
      </div>
    </div>
  `).join("");
}

window.updateExercise = function(i, k, v){
  state.routine[state.selectedWeek][state.selectedDay][i][k] = k === "muscle" ? normalizeMuscle(v) : v;
  saveState(); resetTrainingDraft(); renderAll();
}
window.removeExercise = function(i){
  state.routine[state.selectedWeek][state.selectedDay].splice(i,1);
  saveState(); resetTrainingDraft(); renderAll();
}
function addExercise(){
  state.routine[state.selectedWeek][state.selectedDay].push(ex("Nuevo ejercicio",3,"8-10","—","RIR 2","general",""));
  saveState(); resetTrainingDraft(); renderAll();
}

function addAddedExercise(){
  collectDraftInputs();
  trainingDraft.push({
    name:"Ejercicio agregado",
    sets:3,
    actualSets:3,
    reps:"",
    load:"",
    target:"",
    muscle:"pecho",
    note:"Ejercicio agregado porque cambié o sumé algo al plan.",
    isAdded:true,
    isAlternative:true,
    setsData:[blankSet(1), blankSet(2), blankSet(3)],
    noteDraft:""
  });
  renderTraining();
}

function renderTraining(){
  $("#trainTitle").textContent = `${state.selectedDay} · ${state.selectedWeek}`;
  $("#trainingForm").innerHTML = trainingDraft.map((e,ei)=> renderExerciseRegister(e,ei)).join("");
}

function renderExerciseRegister(e, ei){
  ensureSetsLength(e);
  const prev = findPreviousExercise(e.name);
  const compare = prev && !e.isAdded ? `<div class="compare-box">Referencia anterior: ${escapeHtml(formatBestSet(prev))}.</div>` :
    `<div class="warning-box">${e.isAdded ? "Agregado: elige músculo/tipo para que sus series sumen al progreso semanal." : "Sin registro previo para este ejercicio."}</div>`;

  const rows = e.setsData.map((s,si)=>`
    <tr>
      <td style="font-weight:bold; color:var(--primary);">${si+1}</td>
      <td><input data-ei="${ei}" data-si="${si}" data-field="weight" placeholder="kg" value="${escapeAttr(s.weight)}"></td>
      <td><input data-ei="${ei}" data-si="${si}" data-field="repsDone" placeholder="reps" value="${escapeAttr(s.repsDone)}"></td>
      <td><input data-ei="${ei}" data-si="${si}" data-field="rir" placeholder="RIR/RPE" value="${escapeAttr(s.rir)}"></td>
      <td><input data-ei="${ei}" data-si="${si}" data-field="feeling" placeholder="sensación" value="${escapeAttr(s.feeling)}"></td>
      <td><input data-ei="${ei}" data-si="${si}" data-field="rest" placeholder="min" value="${escapeAttr(s.rest)}"></td>
      <td><input data-ei="${ei}" data-si="${si}" data-field="pain" type="number" min="0" max="10" value="${escapeAttr(s.pain)}"></td>
      <td class="check-cell"><input data-ei="${ei}" data-si="${si}" data-field="done" type="checkbox" ${s.done?"checked":""}>OK</td>
    </tr>
  `).join("");

  return `
    <div class="exercise-card ${e.isAdded ? "add-box":"main-box"}">
      <div class="exercise-head">
        <div>
          ${e.isAdded ? '<span class="pill alt">Agregado</span>' : '<span class="owner-chip">Planificado</span>'}
          <input class="inline-title-input" data-ei="${ei}" data-field="name" value="${escapeAttr(e.name)}" onchange="updateDraftField(${ei}, 'name', this.value)">
          <div class="exercise-meta">
            <span class="pill">Obj: ${escapeHtml(e.reps || "abierto")}</span>
            <span class="pill">RIR/RPE: ${escapeHtml(e.target || "abierto")}</span>
            <span class="pill">Carga: ${escapeHtml(e.load || "abierta")}</span>
            <span class="pill">Músculo: ${escapeHtml(e.muscle || "general")}</span>
          </div>
        </div>
        <div class="stack-actions">
          <select onchange="changeActualSets(${ei}, this.value)">
            ${[1,2,3,4,5,6,7,8].map(n=>`<option value="${n}" ${Number(e.actualSets)===n?"selected":""}>${n} series</option>`).join("")}
          </select>
          <button class="ghost" onclick="removeDraftExercise(${ei})">Quitar</button>
        </div>
      </div>

      <div class="form-grid">
        <label>Tipo / músculo
          <select data-ei="${ei}" data-field="muscle" onchange="updateDraftField(${ei}, 'muscle', this.value)">${muscleOptions(e.muscle)}</select>
        </label>
        <label>Reps objetivo
          <input data-ei="${ei}" data-field="reps" value="${escapeAttr(e.reps || "")}" onchange="updateDraftField(${ei}, 'reps', this.value)">
        </label>
        <label>RIR/RPE objetivo
          <input data-ei="${ei}" data-field="target" value="${escapeAttr(e.target || "")}" onchange="updateDraftField(${ei}, 'target', this.value)">
        </label>
        <label>Carga sugerida
          <input data-ei="${ei}" data-field="load" value="${escapeAttr(e.load || "")}" onchange="updateDraftField(${ei}, 'load', this.value)">
        </label>
      </div>

      ${compare}

      <table class="set-table">
        <thead><tr><th>Serie</th><th>Peso</th><th>Reps</th><th>RIR/RPE</th><th>Sensación</th><th>Descanso</th><th>Dolor</th><th>Check</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>

      <label>Observaciones del ejercicio
        <input data-ei="${ei}" data-field="note" value="${escapeAttr(e.noteDraft || "")}" placeholder="Técnica, molestia, bloqueo, velocidad, etc.">
      </label>
    </div>`;
}

window.updateDraftField = function(i,k,v){
  collectDraftInputs();
  trainingDraft[i][k] = k === "muscle" ? normalizeMuscle(v) : v;
}
window.changeActualSets = function(i,v){
  collectDraftInputs();
  trainingDraft[i].actualSets = Number(v);
  ensureSetsLength(trainingDraft[i]);
  renderTraining();
}
window.removeDraftExercise = function(i){
  collectDraftInputs();
  trainingDraft.splice(i,1);
  renderTraining();
}

function findPreviousExercise(name){
  for(let i=state.sessions.length-1;i>=0;i--){
    const found = state.sessions[i].exercises.find(e => e.name.toLowerCase() === String(name).toLowerCase());
    if(found) return found;
  }
  return null;
}

function formatBestSet(ex){
  const done = ex.sets.filter(s=>s.done || s.weight || s.repsDone);
  if(!done.length) return "sin series registradas";
  const best = done[0];
  return `${best.weight || "—"} kg x ${best.repsDone || "—"} · ${best.rir || "sin RIR/RPE"} · dolor ${best.pain ?? "—"}/10`;
}

function saveSession(){
  collectDraftInputs();
  const exercises = trainingDraft.map(e=>{
    ensureSetsLength(e);
    return {
      name:e.name,
      muscle:normalizeMuscle(e.muscle),
      target:e.target || "",
      actualSets:e.actualSets,
      isAdded:Boolean(e.isAdded),
      isAlternative:Boolean(e.isAdded),
      sets:e.setsData.map((s,i)=>({...s, set:i+1, done:Boolean(s.done || s.weight || s.repsDone)})),
      note:e.noteDraft || ""
    };
  });

  const session = {
    id: Date.now(),
    date: new Date().toLocaleString("es-CL", {dateStyle:"short", timeStyle:"short"}),
    week: state.selectedWeek,
    day: state.selectedDay,
    readiness: {
      sleep: $("#sleepInput").value,
      energy: $("#energyInput").value,
      shoulder: $("#shoulderPainInput").value,
      neck: $("#neckPainInput").value,
      ham: $("#hamPainInput").value,
      motivation: $("#motivationInput").value,
      status: $("#readinessBadge").textContent
    },
    exercises,
    notes: $("#sessionNotes").value
  };

  state.sessions.push(session);
  $("#sessionNotes").value = "";
  saveState();
  alert("Sesión guardada en Prime OS ✅");
  resetTrainingDraft();
  renderAll();
  refreshTopMeta("inicio");
}

function renderHistory(){
  const q = ($("#historySearch")?.value || "").toLowerCase();
  const sessions = [...state.sessions].reverse().filter(s => JSON.stringify(s).toLowerCase().includes(q));
  $("#historyList").innerHTML = sessions.length ? sessions.map(s => `
    <div class="history-card">
      <div class="exercise-head">
        <div>
          <h4>${escapeHtml(s.day)}</h4>
          <p class="small-muted">${escapeHtml(s.date)} · ${escapeHtml(s.week)} · Estado: ${escapeHtml(s.readiness?.status || "—")}</p>
        </div>
        <button class="danger" onclick="deleteSession(${s.id})">Borrar</button>
      </div>
      ${s.exercises.map(e => {
        const validSets = e.sets.filter(x => x.done || x.weight || x.repsDone);
        if(validSets.length === 0) return "";
        return `<p style="font-size:13px; border-bottom:1px solid var(--line); padding-bottom:8px;">
          <strong style="color:var(--primary);">${escapeHtml(e.name)}${e.isAdded ? " · agregado" : ""}:</strong>
          ${validSets.map(x=> `${escapeHtml(x.weight||"-")}kg x ${escapeHtml(x.repsDone||"-")} (${escapeHtml(x.rir||"RIR -")}) · ${escapeHtml(x.feeling||"sin sensación")} · descanso ${escapeHtml(x.rest||"-")} · dolor ${escapeHtml(x.pain||"0")}/10`).join(" | ")}
          ${e.note ? `<br><span class="small-muted">Nota: ${escapeHtml(e.note)}</span>` : ""}
        </p>`;
      }).join("")}
      ${s.notes ? `<div class="compare-box">General: ${escapeHtml(s.notes)}</div>` : ""}
    </div>
  `).join("") : `<p class="small-muted">Base de datos vacía.</p>`;
}
window.deleteSession = function(id){
  state.sessions = state.sessions.filter(s=>s.id!==id);
  saveState(); renderAll();
}

function plannedMuscleSets(week){
  const out = {};
  Object.values(state.routine[week] || {}).flat().forEach(e => {
    const m = normalizeMuscle(e.muscle);
    out[m] = (out[m] || 0) + Number(e.sets || 0);
  });
  return out;
}

function weeklyTargetSets(week){
  if(!state.weeklyTargets[week]) state.weeklyTargets[week] = defaultTargetsFromPlan(state, week);
  return state.weeklyTargets[week];
}

function completedMuscleSets(week){
  const out = {};
  state.sessions.filter(s=>s.week===week).forEach(s=>{
    s.exercises.forEach(e=>{
      const doneSets = e.sets.filter(x=>x.done || x.weight || x.repsDone).length;
      const m = normalizeMuscle(e.muscle);
      out[m] = (out[m] || 0) + doneSets;
    });
  });
  return out;
}

function weeklyCompletion(week){
  const target = weeklyTargetSets(week);
  const done = completedMuscleSets(week);
  const p = Object.values(target).reduce((a,b)=>a+Number(b||0),0);
  const d = Object.entries(done).reduce((sum,[m,v]) => sum + Math.min(v, Number(target[m]||0) || v), 0);
  return p ? Math.min(100, Math.round(d/p*100)) : 0;
}

function muscleBarsHTML(week){
  const target = weeklyTargetSets(week), done = completedMuscleSets(week);
  const muscles = Array.from(new Set([...Object.keys(target),...Object.keys(done)])).filter(m => Number(target[m]||0) > 0 || Number(done[m]||0) > 0).sort();
  if(!muscles.length) return "<p class='small-muted'>Sin datos activos.</p>";
  return muscles.map(m=>{
    const p = Number(target[m] || 0), d = Number(done[m] || 0);
    const pct = p ? Math.min(100,Math.round(d/p*100)) : 0;
    const color = pct >= 80 ? "green" : pct >= 40 ? "yellow" : "";
    return `<div class="progress-row">
      <strong>${escapeHtml(m)}</strong>
      <div>
        <span class="small-muted">${d}/${p || "sin objetivo"} series semanales · ${p ? pct+"%" : "objetivo no definido"}</span>
        <div class="progress-bar ${color}"><span style="width:${p ? pct : 0}%"></span></div>
      </div>
    </div>`;
  }).join("");
}

function renderTargetsEditor(){
  const target = weeklyTargetSets(state.selectedWeek);
  $("#weeklyTargetsEditor").innerHTML = `
    <div class="form-grid three">
      ${MUSCLE_GROUPS.map(m => `
        <label>${escapeHtml(m)}
          <input type="number" min="0" max="40" value="${Number(target[m] || 0)}" onchange="updateTarget('${escapeAttr(m)}', this.value)">
        </label>
      `).join("")}
    </div>
  `;
}
window.updateTarget = function(m,v){
  if(!state.weeklyTargets[state.selectedWeek]) state.weeklyTargets[state.selectedWeek] = {};
  state.weeklyTargets[state.selectedWeek][m] = Number(v) || 0;
  saveState();
  renderHome();
  renderProgress();
}
function resetTargetsFromPlan(){
  state.weeklyTargets[state.selectedWeek] = defaultTargetsFromPlan(state, state.selectedWeek);
  saveState();
  renderProgress();
  renderHome();
}

function renderProgress(){
  renderTargetsEditor();
  $("#weeklyMuscleProgress").innerHTML = muscleBarsHTML(state.selectedWeek);
  $("#strengthProgress").innerHTML = Object.entries(state.prs).map(([k,v]) =>
    `<div class="progress-row"><strong>${escapeHtml(k)}</strong><span class="small-muted">${escapeHtml(v)}</span></div>`
  ).join("");

  const painVals = state.sessions.flatMap(s=>s.exercises.flatMap(e=>e.sets.map(x=>Number(x.pain||0))));
  const avg = painVals.length ? (painVals.reduce((a,b)=>a+b,0)/painVals.length).toFixed(1) : "0";
  const yellowDays = state.sessions.filter(s=>String(s.readiness?.status).toLowerCase().includes("precaución") || String(s.readiness?.status).toLowerCase().includes("amarillo")).length;
  const redDays = state.sessions.filter(s=>String(s.readiness?.status).toLowerCase().includes("peligro") || String(s.readiness?.status).toLowerCase().includes("rojo")).length;
  $("#fatigueProgress").innerHTML = `
    <div class="progress-row"><strong>Dolor promedio</strong><span class="small-muted">${avg}/10</span></div>
    <div class="progress-row"><strong>Días de precaución</strong><span class="small-muted">${yellowDays}</span></div>
    <div class="progress-row"><strong>Días de peligro</strong><span class="small-muted">${redDays}</span></div>
    <div class="warning-box">Regla: si una zona queda sobre 3/10 por 3 sesiones, conviene bajar volumen o usar ejercicio agregado seguro.</div>
  `;
}

function renderCardio(){
  $("#cardioList").innerHTML = state.cardio.map((c,i)=>`
    <div class="mini-card">
      <div class="form-grid">
        <label>Fecha <input value="${escapeAttr(c.date)}" onchange="updateCardio(${i},'date',this.value)"></label>
        <label>Tipo <input value="${escapeAttr(c.type)}" onchange="updateCardio(${i},'type',this.value)"></label>
        <label>Distancia <input value="${escapeAttr(c.distance)}" onchange="updateCardio(${i},'distance',this.value)"></label>
        <label>Ritmo <input value="${escapeAttr(c.pace || "")}" onchange="updateCardio(${i},'pace',this.value)"></label>
        <label>Tiempo <input value="${escapeAttr(c.time)}" onchange="updateCardio(${i},'time',this.value)"></label>
        <label>Sensación <input value="${escapeAttr(c.feeling || "")}" onchange="updateCardio(${i},'feeling',this.value)"></label>
      </div>
      <div class="actions-row" style="margin-top:10px;"><button class="danger" onclick="deleteCardio(${i})">Borrar</button></div>
    </div>
  `).join("");
}
window.updateCardio = (i,k,v)=>{state.cardio[i][k]=v;saveState();};
window.deleteCardio = i=>{state.cardio.splice(i,1);saveState();renderCardio();};
function addCardio(){
  state.cardio.push({date:new Date().toLocaleDateString("es-CL"),type:"Zona 2",distance:"",pace:"",time:"",feeling:""});
  saveState();renderCardio();
}

function renderWeight(){
  $("#weightList").innerHTML = state.weightLog.map((n,i)=>`
    <div class="mini-card">
      <div class="form-grid">
        <label>Fecha <input type="date" value="${escapeAttr(n.date || "")}" onchange="updateWeight(${i},'date',this.value)"></label>
        <label>Semana <input value="${escapeAttr(n.week || "")}" onchange="updateWeight(${i},'week',this.value)"></label>
        <label>Peso promedio/kg <input type="number" step="0.1" value="${escapeAttr(n.avg || "")}" onchange="updateWeight(${i},'avg',this.value)"></label>
        <label>Peso mínimo <input type="number" step="0.1" value="${escapeAttr(n.min || "")}" onchange="updateWeight(${i},'min',this.value)"></label>
        <label>Peso máximo <input type="number" step="0.1" value="${escapeAttr(n.max || "")}" onchange="updateWeight(${i},'max',this.value)"></label>
        <label>Cintura/opcional <input value="${escapeAttr(n.waist || "")}" onchange="updateWeight(${i},'waist',this.value)"></label>
        <label class="wide">Notas <input value="${escapeAttr(n.notes || "")}" onchange="updateWeight(${i},'notes',this.value)"></label>
      </div>
      <div class="actions-row" style="margin-top:10px;"><button class="danger" onclick="deleteWeight(${i})">Borrar</button></div>
    </div>
  `).join("");
  renderChart();
}
window.updateWeight = (i,k,v)=>{
  state.weightLog[i][k]=v;
  saveState();
  renderHome();
  renderChart();
};
window.deleteWeight = i=>{
  state.weightLog.splice(i,1);
  saveState();renderWeight();renderHome();
};
function addWeight(){
  const today = new Date().toISOString().split("T")[0];
  state.weightLog.push({date: today, week:state.selectedWeek, avg:"", min:"", max:"", waist:"", notes:""});
  saveState();renderWeight();
}

function parseNumber(v){
  if(v === null || v === undefined || v === "") return null;
  const n = Number(String(v).replace(",", "."));
  return Number.isFinite(n) ? n : null;
}

function renderChart(){
  const canvas = document.getElementById("bodyWeightChart");
  const fallback = document.getElementById("chartFallback");
  if(!canvas) return;

  const valid = state.weightLog
    .map((w, idx)=>({...w, idx, n: parseNumber(w.avg)}))
    .filter(w => w.n !== null);

  if(!valid.length){
    if(chartInstance) { chartInstance.destroy(); chartInstance = null; }
    fallback.textContent = "Aún no hay pesos numéricos para graficar.";
    return;
  }

  let labels = [];
  let dataPoints = [];
  const mode = $("#weightChartToggle")?.value || "week";

  if(mode === "day"){
    const sorted = valid.sort((a,b)=>{
      const da = a.date ? new Date(a.date).getTime() : a.idx;
      const db = b.date ? new Date(b.date).getTime() : b.idx;
      return da - db;
    });
    labels = sorted.map(w => w.date || w.week || `Peso ${w.idx+1}`);
    dataPoints = sorted.map(w => w.n);
  } else {
    const grouped = {};
    valid.forEach(w=>{
      const key = w.week || "Sin semana";
      if(!grouped[key]) grouped[key] = [];
      grouped[key].push(w.n);
    });
    labels = Object.keys(grouped);
    dataPoints = labels.map(lbl => {
      const arr = grouped[lbl];
      return Number((arr.reduce((a,b)=>a+b,0) / arr.length).toFixed(2));
    });
  }

  fallback.textContent = "";

  if(typeof Chart === "undefined"){
    fallback.innerHTML = "Chart.js no cargó. El gráfico requiere internet, pero los datos siguen guardados.";
    return;
  }

  if(chartInstance) chartInstance.destroy();
  chartInstance = new Chart(canvas.getContext("2d"), {
    type: "line",
    data: {
      labels,
      datasets: [{
        label: "Peso (kg)",
        data: dataPoints,
        borderColor: "#2f81f7",
        backgroundColor: "rgba(47,129,247,0.18)",
        borderWidth: 2,
        pointBackgroundColor: "#c9d1d9",
        fill: true,
        tension: 0.25
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { labels: { color: "#c9d1d9" } } },
      scales: {
        y: { grid: { color: "#30363d" }, ticks: { color: "#8b949e" } },
        x: { grid: { color: "#21262d" }, ticks: { color: "#8b949e" } }
      }
    }
  });
}

function loadSettingsToForm(){
  $("#ownerName").value = state.settings.ownerName || "Martin Reyes";
  $("#goalWeight").value = state.settings.goalWeight || "";
  $("#mainGoal").value = state.settings.mainGoal || "";
  $("#deadliftWeakness").value = state.settings.deadliftWeakness || "";
  $("#sensitiveExercises").value = state.settings.sensitiveExercises || "";
}
function saveSettings(){
  state.settings = {
    ownerName: $("#ownerName").value,
    goalWeight: $("#goalWeight").value,
    mainGoal: $("#mainGoal").value,
    deadliftWeakness: $("#deadliftWeakness").value,
    sensitiveExercises: $("#sensitiveExercises").value
  };
  saveState(); renderAll(); alert("Perfil actualizado ✅");
}
function resetApp(){
  if(confirm("Esto borrará la base de datos local de Prime OS V4. ¿Proceder?")){
    localStorage.removeItem(STORAGE_KEY);
    state = normalizeState(clone(seedData));
    saveState();
    applySidebarPreference();
    fillSelectors();
    resetTrainingDraft();
    renderAll();
  }
}

function exportJson(){
  collectDraftInputs();
  const blob = new Blob([JSON.stringify(state,null,2)], {type:"application/json"});
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "prime_os_martin_reyes_backup.json";
  a.click();
  URL.revokeObjectURL(a.href);
}

function exportExcel(){
  collectDraftInputs();
  const week = $("#exportWeekSelect").value || state.selectedWeek;

  const routineRows = [];
  Object.entries(state.routine[week] || {}).forEach(([day, exercises])=>{
    exercises.forEach(e=>routineRows.push({
      Semana: week, Día: day, Ejercicio: e.name, Músculo: e.muscle,
      "Series planificadas": e.sets, "Reps objetivo": e.reps, "Carga sugerida": e.load,
      "RIR/RPE objetivo": e.target, Nota: e.note || ""
    }));
  });

  const exerciseSummaryRows = [];
  const detailedRows = [];

  state.sessions.filter(s=>s.week===week).forEach((s, sessionIndex)=>{
    s.exercises.forEach(e=>{
      const validSets = e.sets.filter(set => set.done || set.weight || set.repsDone);
      if(!validSets.length) return;

      exerciseSummaryRows.push({
        "Sesión #": sessionIndex + 1,
        Fecha: s.date,
        Semana: s.week,
        Día: s.day,
        Estado: s.readiness?.status || "",
        Ejercicio: e.name,
        Tipo: e.isAdded ? "Agregado" : "Planificado",
        Músculo: e.muscle,
        "Series realizadas": validSets.length,
        "Pesos": validSets.map(x => x.weight || "-").join(" / "),
        "Reps": validSets.map(x => x.repsDone || "-").join(" / "),
        "RIR/RPE": validSets.map(x => x.rir || "-").join(" / "),
        "Descansos": validSets.map(x => x.rest || "-").join(" / "),
        "Sensaciones": validSets.map(x => x.feeling || "-").join(" / "),
        "Dolor": validSets.map(x => x.pain || "0").join(" / "),
        "Observaciones": e.note || "",
        "Nota sesión": s.notes || ""
      });

      validSets.forEach(set=>{
        detailedRows.push({
          "Sesión #": sessionIndex + 1,
          Fecha: s.date,
          Semana: s.week,
          Día: s.day,
          Estado: s.readiness?.status || "",
          Ejercicio: e.name,
          Tipo: e.isAdded ? "Agregado" : "Planificado",
          Músculo: e.muscle,
          Serie: set.set,
          "Peso": set.weight,
          "Reps": set.repsDone,
          "RIR/RPE": set.rir,
          "Descanso": set.rest,
          "Sensación": set.feeling,
          "Dolor": set.pain,
          "Observaciones": e.note || "",
          "Nota sesión": s.notes || ""
        });
      });
    });
  });

  const target = weeklyTargetSets(week), done = completedMuscleSets(week);
  const progressRows = Array.from(new Set([...Object.keys(target),...Object.keys(done)])).sort().map(m=>({
    Semana: week,
    Músculo: m,
    "Objetivo semanal": target[m] || 0,
    "Series registradas": done[m] || 0,
    "% completado": (target[m] ? Math.min(100, Math.round((done[m]||0)/(target[m]||1)*100)) : 0) + "%"
  }));

  const weightRows = state.weightLog.map(w=>({
    Fecha: w.date || "",
    Semana: w.week || "",
    "Peso promedio": w.avg || "",
    "Peso mínimo": w.min || "",
    "Peso máximo": w.max || "",
    Cintura: w.waist || "",
    Notas: w.notes || ""
  }));

  if(typeof XLSX === "undefined"){
    exportCsvFallback(week, exerciseSummaryRows, detailedRows, routineRows, progressRows, weightRows);
    alert("XLSX no cargó porque no hay internet. Exporté CSV como respaldo.");
    return;
  }

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(exerciseSummaryRows), "Resumen ejercicios");
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(detailedRows), "Detalle series");
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(routineRows), "Rutina base");
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(progressRows), "Progreso");
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(weightRows), "Peso corporal");
  XLSX.writeFile(wb, `Prime_OS_${week.replaceAll(" ","_")}_Martin_Reyes.xlsx`);
}

function exportCsvFallback(week, summaryRows, detailedRows, routineRows, progressRows, weightRows){
  const sheets = [
    ["Resumen ejercicios", summaryRows],
    ["Detalle series", detailedRows],
    ["Rutina base", routineRows],
    ["Progreso", progressRows],
    ["Peso corporal", weightRows]
  ];
  const text = sheets.map(([name, rows]) => `### ${name}\n` + toCsv(rows)).join("\n\n");
  const blob = new Blob([text], {type:"text/csv;charset=utf-8"});
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `Prime_OS_${week.replaceAll(" ","_")}_Martin_Reyes.csv`;
  a.click();
  URL.revokeObjectURL(a.href);
}
function toCsv(rows){
  if(!rows.length) return "";
  const headers = Object.keys(rows[0]);
  const esc = v => `"${String(v ?? "").replaceAll('"','""')}"`;
  return [headers.map(esc).join(","), ...rows.map(r=>headers.map(h=>esc(r[h])).join(","))].join("\n");
}


function importData(e){
  const file = e.target.files[0];
  if(!file) return;

  const name = file.name.toLowerCase();

  if(name.endsWith(".json")){
    const reader = new FileReader();
    reader.onload = () => {
      try{
        state = normalizeState(JSON.parse(reader.result));
        saveState(); fillSelectors(); resetTrainingDraft(); renderAll(); alert("Base JSON importada ✅");
      } catch(err){
        alert("Archivo JSON inválido o corrupto.");
      }
    };
    reader.readAsText(file);
    return;
  }

  if(name.endsWith(".xlsx") || name.endsWith(".xls")){
    if(typeof XLSX === "undefined"){
      alert("Para importar Excel necesitas internet o tener cargada la librería XLSX. Prueba con CSV o abre la app con conexión.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      try{
        const workbook = XLSX.read(reader.result, {type:"array"});
        importWorkbookData(workbook);
      } catch(err){
        console.error(err);
        alert("No pude leer el Excel. Revisa que uses la plantilla Prime OS V7.");
      }
    };
    reader.readAsArrayBuffer(file);
    return;
  }

  if(name.endsWith(".csv")){
    if(typeof XLSX === "undefined"){
      alert("Para importar CSV desde esta versión se usa la misma librería XLSX. Abre la app con internet o usa JSON.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      try{
        const workbook = XLSX.read(reader.result, {type:"string"});
        importWorkbookData(workbook);
      } catch(err){
        console.error(err);
        alert("No pude leer el CSV.");
      }
    };
    reader.readAsText(file);
    return;
  }

  alert("Formato no soportado. Usa .xlsx, .xls, .csv o .json.");
}

function sheetToRows(workbook, names){
  for(const n of names){
    const sheetName = workbook.SheetNames.find(s => normalizeHeader(s) === normalizeHeader(n));
    if(sheetName){
      return XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], {defval:""});
    }
  }
  return [];
}

function normalizeHeader(v){
  return String(v ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g,"")
    .replace(/\s+/g,"_")
    .replace(/[^\w]/g,"");
}

function pick(row, aliases){
  const map = {};
  Object.keys(row || {}).forEach(k => map[normalizeHeader(k)] = row[k]);
  for(const a of aliases){
    const key = normalizeHeader(a);
    if(map[key] !== undefined) return map[key];
  }
  return "";
}

function truthyCheck(v){
  const s = String(v ?? "").trim().toLowerCase();
  return ["si","sí","s","yes","y","1","true","ok","x"].includes(s);
}

function addIfMissing(arr, value){
  if(value && !arr.includes(value)) arr.push(value);
}

function importWorkbookData(workbook){
  const rutinaRows = sheetToRows(workbook, ["Rutina_Base","Rutina Base","Rutina"]);
  const registroRows = sheetToRows(workbook, ["Registros","Registro","Historial"]);
  const objetivoRows = sheetToRows(workbook, ["Objetivos_Semanales","Objetivos Semanales","Objetivos"]);

  if(!rutinaRows.length && !registroRows.length && !objetivoRows.length){
    alert("No detecté hojas válidas. Usa hojas: Rutina_Base, Registros y Objetivos_Semanales.");
    return;
  }

  const msg = [
    `Detecté:`,
    `• Rutina_Base: ${rutinaRows.length} filas`,
    `• Registros: ${registroRows.length} filas`,
    `• Objetivos_Semanales: ${objetivoRows.length} filas`,
    ``,
    `Aceptar = importar y actualizar Prime OS.`,
    `La rutina de las semanas/días incluidos será reemplazada por lo que venga en el Excel.`
  ].join("\n");

  if(!confirm(msg)) return;

  const summary = {rutina:0, registros:0, objetivos:0, weeks:new Set(), days:new Set()};

  importRoutineRows(rutinaRows, summary);
  importTargetRows(objetivoRows, summary);
  importRegisterRows(registroRows, summary);

  state = normalizeState(state);
  saveState();
  fillSelectors();
  resetTrainingDraft();
  renderAll();

  alert(`Importación completada ✅\nRutina: ${summary.rutina} ejercicios\nRegistros: ${summary.registros} series\nObjetivos: ${summary.objetivos} filas\nSemanas afectadas: ${Array.from(summary.weeks).join(", ") || "—"}`);
}

function importRoutineRows(rows, summary){
  if(!rows.length) return;

  const grouped = {};
  rows.forEach(row => {
    const week = String(pick(row, ["Semana","Week"]) || "").trim();
    const day = String(pick(row, ["Día","Dia","Day"]) || "").trim();
    const exercise = String(pick(row, ["Ejercicio","Exercise"]) || "").trim();
    if(!week || !day || !exercise) return;

    addIfMissing(state.weeks, week);
    addIfMissing(state.days, day);
    summary.weeks.add(week);
    summary.days.add(day);

    const key = `${week}|||${day}`;
    if(!grouped[key]) grouped[key] = [];
    grouped[key].push({
      name: exercise,
      muscle: normalizeMuscle(pick(row, ["Músculo","Musculo","Muscle","Tipo"])),
      sets: Number(pick(row, ["Series","Sets"])) || 1,
      reps: String(pick(row, ["Reps","Repeticiones","Reps objetivo"]) || "").trim(),
      load: String(pick(row, ["Carga","Peso","Carga sugerida","Load"]) || "").trim(),
      target: String(pick(row, ["RIR/RPE","RIR","RPE","RIR RPE","Objetivo"]) || "").trim(),
      note: String(pick(row, ["Nota","Notas","Observaciones"]) || "").trim()
    });
    summary.rutina++;
  });

  Object.entries(grouped).forEach(([key, exercises]) => {
    const [week, day] = key.split("|||");
    if(!state.routine[week]) state.routine[week] = {};
    state.routine[week][day] = exercises;
  });
}

function importTargetRows(rows, summary){
  rows.forEach(row => {
    const week = String(pick(row, ["Semana","Week"]) || "").trim();
    const muscle = normalizeMuscle(pick(row, ["Músculo","Musculo","Muscle","Tipo"]));
    const objective = Number(pick(row, ["Objetivo semanal","Objetivo","Series objetivo","Series semanales","Target"]));
    if(!week || !muscle || !Number.isFinite(objective)) return;

    addIfMissing(state.weeks, week);
    if(!state.weeklyTargets[week]) state.weeklyTargets[week] = {};
    state.weeklyTargets[week][muscle] = objective;
    summary.weeks.add(week);
    summary.objetivos++;
  });
}

function importRegisterRows(rows, summary){
  if(!rows.length) return;

  const sessionsMap = {};

  rows.forEach(row => {
    const week = String(pick(row, ["Semana","Week"]) || "").trim();
    const day = String(pick(row, ["Día","Dia","Day"]) || "").trim();
    const exercise = String(pick(row, ["Ejercicio","Exercise"]) || "").trim();
    if(!week || !day || !exercise) return;

    const date = String(pick(row, ["Fecha","Date"]) || new Date().toLocaleString("es-CL")).trim();
    const sessionNote = String(pick(row, ["Nota sesión","Nota sesion","Nota general"]) || "").trim();
    const key = `${date}|||${week}|||${day}|||${sessionNote}`;

    addIfMissing(state.weeks, week);
    addIfMissing(state.days, day);
    summary.weeks.add(week);
    summary.days.add(day);

    if(!sessionsMap[key]){
      sessionsMap[key] = {
        id: Date.now() + Math.floor(Math.random()*999999),
        date,
        week,
        day,
        readiness: {status:"Importado", sleep:"", energy:"", shoulder:"", neck:"", ham:"", motivation:""},
        exercises: {},
        notes: sessionNote
      };
    }

    const muscle = normalizeMuscle(pick(row, ["Músculo","Musculo","Muscle","Tipo"]));
    const tipo = String(pick(row, ["Tipo","Origen"]) || "").toLowerCase();
    const exKey = `${exercise}|||${muscle}`;
    if(!sessionsMap[key].exercises[exKey]){
      sessionsMap[key].exercises[exKey] = {
        name: exercise,
        muscle,
        target: "",
        actualSets: 0,
        isAdded: tipo.includes("agregado"),
        isAlternative: tipo.includes("agregado"),
        sets: [],
        note: String(pick(row, ["Observaciones","Nota","Notas"]) || "").trim()
      };
    }

    const setObj = {
      set: Number(pick(row, ["Serie","Set"])) || (sessionsMap[key].exercises[exKey].sets.length + 1),
      weight: String(pick(row, ["Peso","Carga","Weight"]) || "").trim(),
      repsDone: String(pick(row, ["Reps","Repeticiones"]) || "").trim(),
      rir: String(pick(row, ["RIR/RPE","RIR","RPE","RIR RPE"]) || "").trim(),
      feeling: String(pick(row, ["Sensación","Sensacion","Feeling"]) || "").trim(),
      rest: String(pick(row, ["Descanso","Rest"]) || "").trim(),
      pain: String(pick(row, ["Dolor","Pain"]) || "0").trim(),
      done: truthyCheck(pick(row, ["Check","Hecho","Done"])) || Boolean(pick(row, ["Peso","Reps","Repeticiones"]))
    };

    sessionsMap[key].exercises[exKey].sets.push(setObj);
    sessionsMap[key].exercises[exKey].actualSets = sessionsMap[key].exercises[exKey].sets.length;
    summary.registros++;
  });

  Object.values(sessionsMap).forEach(s => {
    s.exercises = Object.values(s.exercises);
    if(s.exercises.length) state.sessions.push(s);
  });
}


function escapeHtml(str){
  return String(str ?? "").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;");
}
function escapeAttr(str){ return escapeHtml(str); }
