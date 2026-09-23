// Importar y exportar: respaldo JSON completo, Excel compatible con la plantilla y CSV de emergencia.
function exportJson(){
  collectDraftInputs();
  const stamp = new Date().toISOString().split("T")[0];
  state.meta.lastBackupAt = new Date().toISOString();
  saveState({touch:false});
  const blob = new Blob([JSON.stringify(state,null,2)], {type:"application/json"});
  downloadBlob(blob, `prime_os_martin_reyes_respaldo_${stamp}.json`);
  renderHome();
  loadSettingsToForm();
}

const ALL_WEEKS = "__all__";

function exportExcel(){
  collectDraftInputs();
  const selected = state.selectedWeek;
  const weeks = selected === ALL_WEEKS ? state.weeks : [selected];
  const inWeeks = w => weeks.includes(w);

  // Hojas con los mismos nombres y columnas que la plantilla: el archivo exportado se puede volver a importar.
  const routineRows = [];
  weeks.forEach(week => {
    Object.entries(state.routine[week] || {}).forEach(([day, exercises])=>{
      exercises.forEach(e=>routineRows.push({
        Semana: week, Día: day, Ejercicio: e.name, Músculo: e.muscle,
        Series: Number(e.sets) || 1, Reps: e.reps || "", Carga: e.load || "",
        "RIR/RPE": e.target || "", Nota: e.note || ""
      }));
    });
  });

  const exerciseSummaryRows = [];
  const registerRows = [];

  state.sessions.filter(s=>inWeeks(s.week)).forEach((s, sessionIndex)=>{
    s.exercises.forEach(e=>{
      const validSets = e.sets.filter(setHasData);
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
        "Pesos": validSets.map(x => formatSetWeight(x)).join(" / "),
        "Mejor 1RM est. (kg)": (() => { const b = bestSet(validSets); const v = b && estimate1RM(b); return v ? Number(v.toFixed(1)) : ""; })(),
        "Volumen (kg)": Math.round(validSets.reduce((a, x) => a + setVolumeKg(x), 0)) || "",
        "Reps": validSets.map(x => x.repsDone || "-").join(" / "),
        "RIR/RPE": validSets.map(x => x.rir || "-").join(" / "),
        "Descansos": validSets.map(x => x.rest || "-").join(" / "),
        "Sensaciones": validSets.map(x => x.feeling || "-").join(" / "),
        "Dolor": validSets.map(x => x.pain || "0").join(" / "),
        "Observaciones": e.note || "",
        "Nota sesión": s.notes || ""
      });

      validSets.forEach(set=>{
        registerRows.push({
          Fecha: s.date,
          Semana: s.week,
          Día: s.day,
          Ejercicio: e.name,
          Músculo: e.muscle,
          Serie: set.set,
          Peso: parseNumber(set.weight) ?? "",
          Unidad: set.unit || "kg",
          "Detalle carga": set.weightNote || "",
          Reps: set.repsDone,
          "RIR/RPE": set.rir,
          Descanso: set.rest,
          Sensación: set.feeling,
          Dolor: set.pain,
          Check: set.done ? "Sí" : "No",
          Observaciones: e.note || "",
          "Nota sesión": s.notes || "",
          Tipo: e.isAdded ? "Agregado" : "Planificado",
          Estado: s.readiness?.status || ""
        });
      });
    });
  });

  const targetRows = [];
  const progressRows = [];
  weeks.forEach(week => {
    const target = weeklyTargetSets(week), done = completedMuscleSets(week);
    Object.keys(target).sort().forEach(m => targetRows.push({Semana: week, Músculo: m, "Objetivo semanal": Number(target[m] || 0)}));
    Array.from(new Set([...Object.keys(target),...Object.keys(done)])).sort().forEach(m => progressRows.push({
      Semana: week,
      Músculo: m,
      "Objetivo semanal": target[m] || 0,
      "Series registradas": done[m] || 0,
      "% completado": (target[m] ? Math.min(100, Math.round((done[m]||0)/target[m]*100)) : 0) + "%"
    }));
  });

  const weightRows = state.weightLog.map(w=>({
    Fecha: w.date || "",
    Semana: w.week || "",
    "Peso promedio": w.avg || "",
    "Peso mínimo": w.min || "",
    "Peso máximo": w.max || "",
    Cintura: w.waist || "",
    Notas: w.notes || ""
  }));

  const cardioRows = state.cardio.map(c=>({
    Fecha: c.date || "",
    Tipo: c.type || "",
    Distancia: c.distance || "",
    Ritmo: c.pace || "",
    Tiempo: c.time || "",
    Sensación: c.feeling || ""
  }));

  const sheets = [
    ["Registros", registerRows],
    ["Resumen ejercicios", exerciseSummaryRows],
    ["Rutina_Base", routineRows],
    ["Objetivos_Semanales", targetRows],
    ["Progreso", progressRows],
    ["Peso_Corporal", weightRows],
    ["Cardio", cardioRows]
  ];
  const label = selected === ALL_WEEKS ? "Todas_las_semanas" : selected.replaceAll(" ","_");

  if(typeof XLSX === "undefined"){
    exportCsvFallback(label, sheets);
    alert("XLSX no cargó porque no hay internet. Exporté CSV como respaldo (usa el respaldo JSON para restaurar todo).");
    return;
  }

  const wb = XLSX.utils.book_new();
  sheets.forEach(([name, rows]) => XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rows), name));
  XLSX.writeFile(wb, `Prime_OS_${label}_Martin_Reyes.xlsx`);
}

function exportCsvFallback(label, sheets){
  const text = sheets.map(([name, rows]) => `### ${name}\n` + toCsv(rows)).join("\n\n");
  const blob = new Blob([text], {type:"text/csv;charset=utf-8"});
  downloadBlob(blob, `Prime_OS_${label}_Martin_Reyes.csv`);
}
function toCsv(rows){
  if(!rows.length) return "";
  const headers = Object.keys(rows[0]);
  const esc = v => `"${String(v ?? "").replaceAll('"','""')}"`;
  return [headers.map(esc).join(","), ...rows.map(r=>headers.map(h=>esc(r[h])).join(","))].join("\n");
}


function importData(e){
  const file = e.target.files[0];
  // Permite volver a elegir el mismo archivo más tarde.
  e.target.value = "";
  if(!file) return;

  const name = file.name.toLowerCase();

  if(name.endsWith(".json")){
    const reader = new FileReader();
    reader.onload = () => {
      let parsed;
      try{
        parsed = JSON.parse(reader.result);
      } catch(err){
        alert("Archivo JSON inválido o corrupto.");
        return;
      }
      if(!confirm("Esto reemplazará todos los datos actuales por el respaldo JSON. ¿Continuar?")) return;
      state = normalizeState(parsed);
      recomputeAutoPRs();
      saveState(); fillSelectors(); resetTrainingDraft(); clearDraftStorage(); renderAll(); alert("Respaldo JSON importado ✅");
    };
    reader.readAsText(file);
    return;
  }

  if(name.endsWith(".xlsx") || name.endsWith(".xls")){
    if(typeof XLSX === "undefined"){
      alert("Para importar Excel necesitas internet o tener cargada la librería XLSX. Prueba con JSON o abre la app con conexión.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      try{
        const workbook = XLSX.read(reader.result, {type:"array", cellDates:true});
        importWorkbookData(workbook);
      } catch(err){
        console.error(err);
        alert("No pude leer el Excel. Revisa que uses la plantilla Prime OS V7 o un Excel exportado desde Prime OS.");
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
        const workbook = XLSX.read(reader.result, {type:"string", cellDates:true});
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


// Excel entrega fechas como Date (cellDates); se guardan como AAAA-MM-DD.
function cellValue(v){
  if(v instanceof Date && !Number.isNaN(v.getTime())){
    const d = new Date(v.getTime() + 12*3600*1000);
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
  }
  return v;
}

function pick(row, aliases){
  const map = {};
  Object.keys(row || {}).forEach(k => map[normalizeHeader(k)] = row[k]);
  for(const a of aliases){
    const key = normalizeHeader(a);
    if(map[key] !== undefined && map[key] !== "") return cellValue(map[key]);
  }
  return "";
}

function pickText(row, aliases){
  return String(pick(row, aliases) ?? "").trim();
}

function truthyCheck(v){
  const s = String(v ?? "").trim().toLowerCase();
  return ["si","sí","s","yes","y","1","true","ok","x"].includes(s);
}

function falsyCheck(v){
  const s = String(v ?? "").trim().toLowerCase();
  return ["no","n","0","false"].includes(s);
}

function addIfMissing(arr, value){
  if(value && !arr.includes(value)) arr.push(value);
}

// Solo series con datos (igual que el Excel exportado) para detectar sesiones ya importadas.
function sessionSignature(s){
  const exercises = (s.exercises || []).map(e => {
    const sets = (e.sets || []).filter(setHasData);
    return sets.length ? `${String(e.name).toLowerCase()}:${sets.map(x => `${x.weight ?? ""}${x.unit || ""}/${x.repsDone ?? ""}`).join(",")}` : "";
  }).filter(Boolean).sort().join(";");
  return `${s.date}|${s.week}|${s.day}|${exercises}`;
}

function importWorkbookData(workbook){
  const rutinaRows = sheetToRows(workbook, ["Rutina_Base","Rutina Base","Rutina"]);
  const registroRows = sheetToRows(workbook, ["Registros","Registro","Detalle series","Historial"]);
  const objetivoRows = sheetToRows(workbook, ["Objetivos_Semanales","Objetivos Semanales","Objetivos"]);
  const pesoRows = sheetToRows(workbook, ["Peso_Corporal","Peso corporal","Peso"]);
  const cardioRows = sheetToRows(workbook, ["Cardio"]);

  if(!rutinaRows.length && !registroRows.length && !objetivoRows.length && !pesoRows.length && !cardioRows.length){
    alert("No detecté hojas válidas. Usa hojas: Rutina_Base, Registros, Objetivos_Semanales, Peso_Corporal o Cardio.");
    return;
  }

  const msg = [
    `Detecté:`,
    `• Rutina_Base: ${rutinaRows.length} filas`,
    `• Registros: ${registroRows.length} filas`,
    `• Objetivos_Semanales: ${objetivoRows.length} filas`,
    `• Peso_Corporal: ${pesoRows.length} filas`,
    `• Cardio: ${cardioRows.length} filas`,
    ``,
    `Aceptar = importar y actualizar Prime OS.`,
    `La rutina de las semanas/días incluidos será reemplazada por lo que venga en el Excel.`,
    `Las sesiones, pesos y cardio ya existentes no se duplican.`
  ].join("\n");

  if(!confirm(msg)) return;

  const summary = {rutina:0, registros:0, sesionesOmitidas:0, objetivos:0, pesos:0, cardio:0, weeks:new Set(), days:new Set()};

  importRoutineRows(rutinaRows, summary);
  importTargetRows(objetivoRows, summary);
  importRegisterRows(registroRows, summary);
  importWeightRows(pesoRows, summary);
  importCardioRows(cardioRows, summary);

  state = normalizeState(state);
  recomputeAutoPRs();
  saveState();
  fillSelectors();
  if(!draftHasData()) resetTrainingDraft();
  renderAll();

  alert([
    `Importación completada ✅`,
    `Rutina: ${summary.rutina} ejercicios`,
    `Registros: ${summary.registros} series${summary.sesionesOmitidas ? ` (${summary.sesionesOmitidas} sesiones ya existían y se omitieron)` : ""}`,
    `Objetivos: ${summary.objetivos} filas`,
    `Peso corporal: ${summary.pesos} registros nuevos`,
    `Cardio: ${summary.cardio} registros nuevos`,
    `Semanas afectadas: ${Array.from(summary.weeks).join(", ") || "—"}`
  ].join("\n"));
}

function importRoutineRows(rows, summary){
  if(!rows.length) return;

  const grouped = {};
  rows.forEach(row => {
    const week = pickText(row, ["Semana","Week"]);
    const day = pickText(row, ["Día","Dia","Day"]);
    const exercise = pickText(row, ["Ejercicio","Exercise"]);
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
      sets: Number(pick(row, ["Series","Series planificadas","Sets"])) || 1,
      reps: pickText(row, ["Reps","Repeticiones","Reps objetivo"]),
      load: pickText(row, ["Carga","Peso","Carga sugerida","Load"]),
      target: pickText(row, ["RIR/RPE","RIR/RPE objetivo","RIR","RPE","RIR RPE","Objetivo"]),
      note: pickText(row, ["Nota","Notas","Observaciones"])
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
    const week = pickText(row, ["Semana","Week"]);
    const rawMuscle = pickText(row, ["Músculo","Musculo","Muscle","Tipo"]);
    const rawObjective = pickText(row, ["Objetivo semanal","Objetivo","Series objetivo","Series semanales","Target"]);
    const objective = parseNumber(rawObjective);
    if(!week || !rawMuscle || objective === null) return;

    addIfMissing(state.weeks, week);
    if(!state.weeklyTargets[week]) state.weeklyTargets[week] = {};
    state.weeklyTargets[week][normalizeMuscle(rawMuscle)] = objective;
    summary.weeks.add(week);
    summary.objetivos++;
  });
}

function importRegisterRows(rows, summary){
  if(!rows.length) return;

  const sessionsMap = {};
  let setCount = 0;

  rows.forEach(row => {
    const week = pickText(row, ["Semana","Week"]);
    const day = pickText(row, ["Día","Dia","Day"]);
    const exercise = pickText(row, ["Ejercicio","Exercise"]);
    if(!week || !day || !exercise) return;

    const date = pickText(row, ["Fecha","Date"]) || new Date().toLocaleString("es-CL");
    const sessionNote = pickText(row, ["Nota sesión","Nota sesion","Nota general"]);
    const key = `${date}|||${week}|||${day}|||${sessionNote}`;

    addIfMissing(state.weeks, week);

    if(!sessionsMap[key]){
      sessionsMap[key] = {
        id: Date.now() + Math.floor(Math.random()*999999),
        date,
        week,
        day,
        readiness: {status: pickText(row, ["Estado"]) || "Importado", sleep:"", energy:"", shoulder:"", neck:"", ham:"", motivation:""},
        exercises: {},
        notes: sessionNote
      };
    }

    // En Registros, "Tipo" indica Planificado/Agregado, no el músculo.
    const muscle = normalizeMuscle(pick(row, ["Músculo","Musculo","Muscle"]));
    const tipo = pickText(row, ["Tipo","Origen"]).toLowerCase();
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
        note: pickText(row, ["Observaciones","Nota","Notas"])
      };
    }

    const weight = pickText(row, ["Peso","Carga","Weight"]);
    const unitCol = pickText(row, ["Unidad","Unit"]).toLowerCase();
    const repsDone = pickText(row, ["Reps","Repeticiones"]);
    const check = pick(row, ["Check","Hecho","Done"]);
    const setObj = normalizeSet({
      set: Number(pick(row, ["Serie","Set"])) || (sessionsMap[key].exercises[exKey].sets.length + 1),
      weight,
      unit: unitCol.startsWith("lb") ? "lbs" : unitCol === "kg" ? "kg" : undefined,
      weightNote: pickText(row, ["Detalle carga","Detalle peso"]),
      repsDone,
      rir: pickText(row, ["RIR/RPE","RIR","RPE","RIR RPE"]),
      feeling: pickText(row, ["Sensación","Sensacion","Feeling"]),
      rest: pickText(row, ["Descanso","Rest"]),
      pain: pickText(row, ["Dolor","Pain"]) || "0"
    }, 0);
    setObj.done = truthyCheck(check) || (!falsyCheck(check) && Boolean(weight || repsDone));

    sessionsMap[key].exercises[exKey].sets.push(setObj);
    sessionsMap[key].exercises[exKey].actualSets = sessionsMap[key].exercises[exKey].sets.length;
    setCount++;
  });

  const existing = new Set(state.sessions.map(sessionSignature));
  Object.values(sessionsMap).forEach(s => {
    s.exercises = Object.values(s.exercises);
    if(!s.exercises.length) return;
    const setsInSession = s.exercises.reduce((n, e) => n + e.sets.length, 0);
    if(existing.has(sessionSignature(s))){
      summary.sesionesOmitidas++;
      setCount -= setsInSession;
      return;
    }
    existing.add(sessionSignature(s));
    state.sessions.push(s);
    summary.weeks.add(s.week);
    summary.days.add(s.day);
  });
  summary.registros += setCount;
}

function importWeightRows(rows, summary){
  const key = w => `${w.date}|${w.week}|${w.avg}|${w.min}|${w.max}`;
  const existing = new Set(state.weightLog.map(key));
  rows.forEach(row => {
    const w = {
      date: pickText(row, ["Fecha","Date"]),
      week: pickText(row, ["Semana","Week"]),
      avg: pickText(row, ["Peso promedio","Peso","Promedio","Weight"]),
      min: pickText(row, ["Peso mínimo","Peso minimo","Mínimo","Min"]),
      max: pickText(row, ["Peso máximo","Peso maximo","Máximo","Max"]),
      waist: pickText(row, ["Cintura","Waist"]),
      notes: pickText(row, ["Notas","Nota","Notes"])
    };
    if(!w.avg && !w.min && !w.max && !w.notes) return;
    if(existing.has(key(w))) return;
    existing.add(key(w));
    state.weightLog.push(w);
    summary.pesos++;
  });
}

function importCardioRows(rows, summary){
  const key = c => `${c.date}|${c.type}|${c.distance}|${c.time}`;
  const existing = new Set(state.cardio.map(key));
  rows.forEach(row => {
    const c = {
      date: pickText(row, ["Fecha","Date"]),
      type: pickText(row, ["Tipo","Type"]),
      distance: pickText(row, ["Distancia","Distance"]),
      pace: pickText(row, ["Ritmo","Pace"]),
      time: pickText(row, ["Tiempo","Time"]),
      feeling: pickText(row, ["Sensación","Sensacion","Feeling"])
    };
    if(!c.type && !c.distance && !c.time) return;
    if(existing.has(key(c))) return;
    existing.add(key(c));
    state.cardio.push(c);
    summary.cardio++;
  });
}
