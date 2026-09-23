// Utilidades compartidas: DOM, texto, números y almacenamiento seguro.
const $ = sel => document.querySelector(sel);
const $$ = sel => Array.from(document.querySelectorAll(sel));

function clone(obj){ return JSON.parse(JSON.stringify(obj)); }

function escapeHtml(str){
  return String(str ?? "").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;");
}
function escapeAttr(str){ return escapeHtml(str); }

function stripAccents(v){
  return String(v ?? "").normalize("NFD").replace(/[̀-ͯ]/g,"");
}

function parseNumber(v){
  if(v === null || v === undefined || v === "") return null;
  const n = Number(String(v).trim().replace(",", "."));
  return Number.isFinite(n) ? n : null;
}

// Primer número dentro de un texto ("10 por pierna" → 10, "2-3 min" → 2).
function firstNumber(v){
  const m = String(v ?? "").replace(",", ".").match(/-?\d+(?:\.\d+)?/);
  return m ? Number(m[0]) : null;
}

function formatNumber(n, decimals = 1){
  if(n === null || n === undefined || !Number.isFinite(n)) return "—";
  return Number(n.toFixed(decimals)).toLocaleString("es-CL");
}

function normalizeHeader(v){
  return stripAccents(String(v ?? "").trim().toLowerCase())
    .replace(/\s+/g,"_")
    .replace(/[^\w]/g,"");
}

function storageGet(store, key){
  try { return window[store].getItem(key); } catch(e){ return null; }
}
function storageSet(store, key, value){
  try { window[store].setItem(key, value); return true; } catch(e){ return false; }
}
function storageRemove(store, key){
  try { window[store].removeItem(key); } catch(e){}
}

function downloadBlob(blob, filename){
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

function todayIso(){
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}

function daysSince(iso){
  if(!iso) return Infinity;
  const t = new Date(iso).getTime();
  return Number.isFinite(t) ? (Date.now() - t) / 86400000 : Infinity;
}

function debounce(fn, ms){
  let t = null;
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
}

function toast(message, kind = "info", ms = 3500){
  let box = $("#toastBox");
  if(!box){
    box = document.createElement("div");
    box.id = "toastBox";
    box.className = "toast-box";
    box.setAttribute("role", "status");
    box.setAttribute("aria-live", "polite");
    document.body.appendChild(box);
  }
  const el = document.createElement("div");
  el.className = `toast ${kind}`;
  el.textContent = message;
  box.appendChild(el);
  setTimeout(() => el.remove(), ms);
}
