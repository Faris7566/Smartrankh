/* ======================================================
KONFIGURASI KATEGORI, MAPEL, PRODI (BOBOT)
====================================================== */

const CATS = ["IPA","IPS","BAHASA","SENI","TEKNOLOGI","KESEHATAN","UMUM"];
const CAT_LABEL = {
  IPA:"Ilmu Pengetahuan Alam",
  IPS:"Ilmu Pengetahuan Sosial",
  BAHASA:"Bahasa & Sastra",
  SENI:"Seni/Desain",
  TEKNOLOGI:"Teknologi & Komputer",
  KESEHATAN:"Kesehatan",
  UMUM:"Umum"
};

// DEFAULT MAPEL (kategori paten) — user tidak bisa ubah kategori
const DEFAULT_SUBJECTS = [
  ["Pendidikan Agama", "UMUM"],
  ["PPKn", "UMUM"],
  ["Sejarah Indonesia","UMUM"],
  ["PJOK","UMUM"],
  ["Prakarya/Kewirausahaan","UMUM"],

  ["Bahasa Indonesia", "BAHASA"],
  ["Bahasa Indonesia Tingkat Lanjut","BAHASA"],
  ["Bahasa Inggris", "BAHASA"],
  ["Bahasa Inggris Tingkat Lanjut","BAHASA"],
  ["Bahasa Daerah","BAHASA"],

  ["Bahasa Jepang","BAHASA"],
  ["Bahasa Korea","BAHASA"],
  ["Bahasa Mandarin","BAHASA"],
  ["Bahasa Arab","BAHASA"],
  ["Bahasa Jerman","BAHASA"],
  ["Bahasa Prancis","BAHASA"],

  ["Seni Budaya", "SENI"],
  ["Informatika/TIK","TEKNOLOGI"],

  ["Matematika Wajib","IPA"],
  ["Matematika Lanjutan (Peminatan)","IPA"],
  ["Fisika","IPA"],
  ["Kimia","IPA"],
  ["Biologi","IPA"],

  ["Ekonomi","IPS"],
  ["Sosiologi","IPS"],
  ["Geografi","IPS"],
  ["Antropologi","IPS"],
  ["Sejarah Tingkat Lanjut","IPS"]
];

// MAJORS: bobot kategori per jurusan (harus diupdate bila ada data terbaru)
const MAJORS = [
  ["Teknik Informatika",    {TEKNOLOGI:0.6, IPA:0.3, UMUM:0.1}],
  ["Sistem Informasi",      {TEKNOLOGI:0.55, IPS:0.25, IPA:0.2}],
  ["Teknik Elektro",        {IPA:0.55, TEKNOLOGI:0.35, UMUM:0.1}],
  ["Teknik Mesin",          {IPA:0.6, TEKNOLOGI:0.3, UMUM:0.1}],
  ["Arsitektur",            {SENI:0.35, IPA:0.45, UMUM:0.2}],
  ["Manajemen",             {IPS:0.6, UMUM:0.3, TEKNOLOGI:0.1}],
  ["Akuntansi",             {IPS:0.65, UMUM:0.35}],
  ["Ilmu Komunikasi",       {IPS:0.5, BAHASA:0.3, UMUM:0.2}],
  ["Hubungan Internasional",{IPS:0.5, BAHASA:0.35, UMUM:0.15}],
  ["Sosiologi",             {IPS:0.75, UMUM:0.25}],
  ["Kedokteran",            {IPA:0.55, KESEHATAN:0.35, UMUM:0.1}],
  ["Farmasi",               {IPA:0.5, KESEHATAN:0.35, TEKNOLOGI:0.15}],
  ["Keperawatan",           {KESEHATAN:0.6, IPA:0.3, UMUM:0.1}],
  ["Kesehatan Masyarakat",  {KESEHATAN:0.5, IPS:0.25, IPA:0.25}],
  ["Statistika",            {IPA:0.6, TEKNOLOGI:0.25, UMUM:0.15}],
  ["Matematika",            {IPA:0.7, UMUM:0.3}],
  ["Fisika",                {IPA:0.75, UMUM:0.25}],
  ["Kimia",                 {IPA:0.75, UMUM:0.25}],
  ["Biologi",               {IPA:0.7, UMUM:0.3}],
  ["Teknik Sipil",          {IPA:0.6, UMUM:0.4}],
  ["Arsitektur (DKV)",      {SENI:0.7, BAHASA:0.2, UMUM:0.1}]
];

/* ======================================================
STATE & HELPERS
====================================================== */

let rows = []; // each row {id,name,cat,s:[s1..s5], default:Boolean}
const KEY = "snbp-rapor-v2";
const $ = (q,root=document)=>root.querySelector(q);
const $$ = (q,root=document)=>Array.from((root||document).querySelectorAll(q));
const uuid = ()=>Math.random().toString(36).slice(2,9);

const avg = arr=>{
  const nums = arr.filter(x=>typeof x==="number" && !isNaN(x));
  return nums.length ? nums.reduce((a,b)=>a+b,0)/nums.length : NaN;
};
const fmt = n => isNaN(n) ? "—" : (Math.round(n*10)/10).toFixed(1);

/* ======================================================
BUILD TABLE (rows from DEFAULT_SUBJECTS)
====================================================== */

function addRow(name,cat,s=[ "","","","","" ], isDefault=false){
  rows.push({id:uuid(), name, cat, s, default:isDefault});
}
function loadDefaults(){
  rows = [];
  DEFAULT_SUBJECTS.forEach(([n,c])=>addRow(n,c,["","","","",""], true));
}
function saveSession(){ sessionStorage.setItem(KEY, JSON.stringify(rows)); }
function saveLocal(){ localStorage.setItem(KEY, JSON.stringify(rows)); toast("✅ Data tersimpan di browser."); }
function loadSession(){ const raw = sessionStorage.getItem(KEY); if(raw) rows = JSON.parse(raw); }
function loadLocal(){ const raw = localStorage.getItem(KEY); if(raw){ rows = JSON.parse(raw); renderTable(); toast("✅ Data dimuat dari penyimpanan."); } else toast("⚠ Tidak ada data tersimpan."); }

/* render table */
function renderTable(){
  const tb = $("#tbody");
  if(!tb) return;
  tb.innerHTML = "";
  rows.forEach(r=>{
    const tr = document.createElement("tr");
    const isDefault = r.default === true;
    tr.innerHTML = `
      <td data-label="Mapel"><input type="text" value="${escapeHtml(r.name)}" ${isDefault ? "readonly" : ""} data-id="${r.id}" data-key="name" /></td>
      <td data-label="Kategori"><span class="badge">${r.cat}</span></td>
      ${[0,1,2,3,4].map(i=>`<td data-label="S${i+1}"><input type="number" min="0" max="100" step="0.1" data-id="${r.id}" data-key="s${i}" value="${r.s[i] ?? ""}" /></td>`).join("")}
      <td data-label="Rerata"><span class="mean mono">${fmt(subjectMean(r))}</span></td>
      <td data-label="Aksi">${isDefault? "": `<button class="btn small danger" data-del="${r.id}">Hapus</button>`}</td>
    `;
    tb.appendChild(tr);
  });

  // bind inputs
  $$("#tbody input[data-key]").forEach(el=>{
    el.oninput = (e)=>{
      const id = el.dataset.id;
      const key = el.dataset.key;
      const row = rows.find(rr=>rr.id===id);
      if(!row) return;
      if(key==="name") { row.name = el.value; }
      else if(key && key.startsWith("s")){
        const idx = Number(key.slice(1));
        const v = el.value.trim()==="" ? "" : Number(el.value);
        row.s[idx] = (v===""||isNaN(v)) ? "" : Math.max(0,Math.min(100,v));
        // update mean display
        const meanSpan = el.closest("tr").querySelector(".mean");
        if(meanSpan) meanSpan.textContent = fmt(subjectMean(row));
      }
      saveSession();
    };
  });

  // delete
  $$("#tbody button[data-del]").forEach(b=> b.onclick = ()=>{
    rows = rows.filter(r=>r.id !== b.dataset.del);
    renderTable(); saveSession();
  });
}

/* compute mean for subject row (equal weights) */
function subjectMean(subj){
  const vals = subj.s.map(x=> x==="" ? NaN : Number(x));
  const valid = vals.filter(v=>!isNaN(v));
  return valid.length ? avg(valid) : NaN;
}

/* ======================================================
CATEGORY SCORES, with KESEHATAN derived from IPA if empty
====================================================== */

function catScores(){
  // collect per-cat
  const byCat = {}; CATS.forEach(c=>byCat[c]=[]);
  rows.forEach(r=>{
    const m = subjectMean(r);
    if(!isNaN(m) && byCat[r.cat]) byCat[r.cat].push(m);
  });

  // if KESEHATAN empty, fallback to IPA values
  if((!byCat["KESEHATAN"] || byCat["KESEHATAN"].length===0) && (byCat["IPA"] && byCat["IPA"].length>0)){
    // copy IPA array into KESEHATAN so it won't be zero
    byCat["KESEHATAN"] = byCat["IPA"].slice();
  }

  // compute averages normalized 0..1
  const out = {};
  CATS.forEach(c=>{
    const a = avg(byCat[c]);
    out[c] = isNaN(a) ? 0 : (a/100);
  });
  return out;
}

/* ======================================================
Recommendation using MAJORS bobot
====================================================== */

function normalizeWeights(wmap){
  const keys = Object.keys(wmap);
  const sum = keys.reduce((a,k)=>a + (wmap[k]||0),0) || 1;
  const out = {};
  keys.forEach(k=> out[k] = (wmap[k]||0)/sum);
  return out;
}

function computeRecommendations(){
  const cs = catScores(); // object cat->0..1
  const items = MAJORS.map(([name,wmap])=>{
    const W = normalizeWeights(wmap);
    let s = 0;
    for(const k of Object.keys(W)){
      s += (W[k]||0) * (cs[k]||0);
    }
    return { name, score: s, weights: W };
  }).sort((a,b)=>b.score - a.score);
  return { items, cs };
}

/* ======================================================
RENDER KPI + RECOMMENDATIONS + CHART
====================================================== */

let radarChart = null;
function renderKPI(cs){
  const box = $("#kpiGrid");
  if(!box) return;
  box.innerHTML = "";
  CATS.forEach(c=>{
    const val = Math.round((cs[c]||0)*1000)/10; // 0..100 with 1dp
    const el = document.createElement("div");
    el.className = "kpi-item";
    el.innerHTML = `
      <div><h4>${CAT_LABEL[c]}</h4></div>
      <div class="kpi-score">${val}<span class="mini">/100</span></div>
      <div class="kpi-bar"><div class="kpi-fill" style="width:${Math.max(4, val)}%"></div></div>
    `;
    box.appendChild(el);
  });
}

function renderRecommendationsList(items){
  const box = $("#recList");
  if(!box) return;
  const top = items.slice(0,20);
  box.innerHTML = top.map((it,i)=>{
    const pct = Math.round(it.score*1000)/10; // display like 87.5
    return `
      <div class="rec-item">
        <div class="rec-top">
          <span class="rec-rank">${i+1}</span>
          <span class="rec-name">${escapeHtml(it.name)}</span>
          <span class="rec-score">${pct}/100</span>
        </div>
        <div class="rec-bar"><div class="rec-fill" style="width:${Math.max(3,pct)}%"></div></div>
      </div>
    `;
  }).join("");
}

function renderChart(cs){
  const ctx = document.getElementById("clusterChart");
  if(!ctx) return;
  const labels = CATS.map(c => CAT_LABEL[c]);
  const data = CATS.map(c=> Math.round((cs[c]||0)*1000)/10);
  if(window.Chart && radarChart) radarChart.destroy();
  if(!window.Chart) return; // Chart.js not loaded
  radarChart = new Chart(ctx, {
    type: "radar",
    data: {
      labels,
      datasets: [{
        label: "Skor Klaster",
        data,
        backgroundColor: "rgba(92,200,255,0.12)",
        borderColor: "rgba(92,200,255,0.9)",
        pointBackgroundColor: "rgba(92,200,255,0.95)",
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      scales: {
        r: {
          grid: { color: "rgba(255,255,255,0.06)" },
          angleLines: { color: "rgba(255,255,255,0.06)" },
          pointLabels: { color: "#cfe6ff" },
          ticks: { color: "#9fb6df", stepSize: 20, backdropColor: "transparent" }
        }
      },
      plugins: { legend: { labels: { color: "#e6f3ff" } } }
    }
  });
}

/* ======================================================
UI ACTIONS
====================================================== */

function runCalcAndRender(){
  const { items, cs } = computeRecommendations();
  renderKPI(cs);
  renderRecommendationsList(items);
  renderChart(cs);
  toast("✅ Perhitungan selesai — lihat rekomendasi & grafik.");
  saveSession();
}

/* helper: escape HTML in values to avoid injection when inserting raw text */
function escapeHtml(unsafe){
  return String(unsafe)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/* bind UI buttons safely (if elements exist) */
const btnRun = $("#btnRun");
if(btnRun) btnRun.onclick = runCalcAndRender;

const btnFill = $("#btnFill");
if(btnFill) btnFill.onclick = ()=>{
  // fill sample values for many mapel (at least 14)
  const fill = {
    "Matematika Wajib":[85,86,88,90,92],
    "Matematika Lanjutan (Peminatan)":[82,84,86,90,93],
    "Fisika":[84,85,87,90,92],
    "Kimia":[83,85,86,88,90],
    "Biologi":[86,87,88,90,91],
    "Ekonomi":[82,83,85,87,90],
    "Sosiologi":[80,82,84,86,88],
    "Geografi":[81,83,84,86,89],
    "Bahasa Indonesia":[84,85,86,88,90],
    "Bahasa Inggris":[82,84,86,88,90],
    "Bahasa Daerah":[80,82,84,86,88],
    "Informatika/TIK":[85,86,88,91,94],
    "Seni Budaya":[80,82,83,85,87],
    "Sejarah Indonesia":[80,81,83,85,86],
    "Pendidikan Agama":[78,80,82,84,86]
  };
  rows.forEach(r=>{
    if(fill[r.name]) r.s = fill[r.name].slice();
  });
  renderTable();
  saveSession();
  toast("✨ Contoh nilai terisi.");
};

const btnAddRow = $("#btnAddRow");
if(btnAddRow) btnAddRow.onclick = ()=>{ addRow("Mapel Kustom","UMUM",["","","","",""], false); renderTable(); saveSession(); };

const btnSave = $("#btnSave");
if(btnSave) btnSave.onclick = ()=> saveLocal();

const btnLoad = $("#btnLoad");
if(btnLoad) btnLoad.onclick = ()=> loadLocal();

const btnReset = $("#btnReset");
if(btnReset) btnReset.onclick = ()=> { if(confirm("Reset ke daftar mapel default?")){ loadDefaults(); renderTable(); saveSession(); toast("♻️ Reset selesai."); } };

/* Download JSON */
const btnDownloadJSON = $("#btnDownloadJSON");
if(btnDownloadJSON) btnDownloadJSON.onclick = ()=>{
  const blob = new Blob([JSON.stringify(rows,null,2)], {type:"application/json"});
  const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "nilai-rapor-snbp.json"; a.click(); URL.revokeObjectURL(a.href);
};

/* ======================================================
UPLOAD XLS / XLSX (SheetJS)
Expect columns: Nama Mapel, Kategori, S1..S5
====================================================== */


/* ======================================================
TOAST
====================================================== */
function toast(msg){
  const t = document.createElement("div");
  t.className = "toast";
  t.textContent = msg;
  Object.assign(t.style, {
    position:"fixed", left:"50%", transform:"translateX(-50%)",
    bottom:"18px", background:"#0e1730", color:"#eaf6ff", padding:"10px 14px",
    border:"1px solid rgba(100,130,200,0.12)", borderRadius:"10px", zIndex:9999
  });
  document.body.appendChild(t);
  setTimeout(()=>t.remove(),2200);
}

/* ======================================================
INIT
====================================================== */
function boot(){
  catLegend();
  loadDefaults();
  loadSession(); // prefer session if exist
  // if loadSession replaced rows, don't overwrite with defaults; logic above loads defaults then session overwrites
  renderTable();
}
function catLegend(){
  // show badges (not editable)
  const legendHolder = document.createElement("div");
  legendHolder.style.marginTop = "8px";
  CATS.forEach(c=>{
    const s = document.createElement("span");
    s.className = "badge mini";
    s.textContent = c;
    s.style.marginRight = "6px";
    legendHolder.appendChild(s);
  });
  // append near top
  const panel = document.querySelector(".panel");
  if(panel){
    const head = panel.querySelector(".panel-head");
    if(head) head.appendChild(legendHolder);
  }
}

boot();function saveLocal(){ localStorage.setItem(KEY, JSON.stringify(rows)); toast("✅ Data tersimpan di browser."); }
function loadSession(){ const raw = sessionStorage.getItem(KEY); if(raw) rows = JSON.parse(raw); }
function loadLocal(){ const raw = localStorage.getItem(KEY); if(raw){ rows = JSON.parse(raw); renderTable(); toast("✅ Data dimuat dari penyimpanan."); } else toast("⚠ Tidak ada data tersimpan."); }

/* render table */
function renderTable(){
  const tb = $("#tbody");
  if(!tb) return;
  tb.innerHTML = "";
  rows.forEach(r=>{
    const tr = document.createElement("tr");
    const isDefault = r.default === true;
    tr.innerHTML = `
      <td data-label="Mapel"><input type="text" value="${escapeHtml(r.name)}" ${isDefault ? "readonly" : ""} data-id="${r.id}" data-key="name" /></td>
      <td data-label="Kategori"><span class="badge">${r.cat}</span></td>
      ${[0,1,2,3,4].map(i=>`<td data-label="S${i+1}"><input type="number" min="0" max="100" step="0.1" data-id="${r.id}" data-key="s${i}" value="${r.s[i] ?? ""}" /></td>`).join("")}
      <td data-label="Rerata"><span class="mean mono">${fmt(subjectMean(r))}</span></td>
      <td data-label="Aksi">${isDefault? "": `<button class="btn small danger" data-del="${r.id}">Hapus</button>`}</td>
    `;
    tb.appendChild(tr);
  });

  // bind inputs
  $$("#tbody input[data-key]").forEach(el=>{
    el.oninput = (e)=>{
      const id = el.dataset.id;
      const key = el.dataset.key;
      const row = rows.find(rr=>rr.id===id);
      if(!row) return;
      if(key==="name") { row.name = el.value; }
      else if(key && key.startsWith("s")){
        const idx = Number(key.slice(1));
        const v = el.value.trim()==="" ? "" : Number(el.value);
        row.s[idx] = (v===""||isNaN(v)) ? "" : Math.max(0,Math.min(100,v));
        // update mean display
        const meanSpan = el.closest("tr").querySelector(".mean");
        if(meanSpan) meanSpan.textContent = fmt(subjectMean(row));
      }
      saveSession();
    };
  });

  // delete
  $$("#tbody button[data-del]").forEach(b=> b.onclick = ()=>{
    rows = rows.filter(r=>r.id !== b.dataset.del);
    renderTable(); saveSession();
  });
}

/* compute mean for subject row (equal weights) */
function subjectMean(subj){
  const vals = subj.s.map(x=> x==="" ? NaN : Number(x));
  const valid = vals.filter(v=>!isNaN(v));
  return valid.length ? avg(valid) : NaN;
}

/* ======================================================
CATEGORY SCORES, with KESEHATAN derived from IPA if empty
====================================================== */

function catScores(){
  // collect per-cat
  const byCat = {}; CATS.forEach(c=>byCat[c]=[]);
  rows.forEach(r=>{
    const m = subjectMean(r);
    if(!isNaN(m) && byCat[r.cat]) byCat[r.cat].push(m);
  });

  // if KESEHATAN empty, fallback to IPA values
  if((!byCat["KESEHATAN"] || byCat["KESEHATAN"].length===0) && (byCat["IPA"] && byCat["IPA"].length>0)){
    // copy IPA array into KESEHATAN so it won't be zero
    byCat["KESEHATAN"] = byCat["IPA"].slice();
  }

  // compute averages normalized 0..1
  const out = {};
  CATS.forEach(c=>{
    const a = avg(byCat[c]);
    out[c] = isNaN(a) ? 0 : (a/100);
  });
  return out;
}

/* ======================================================
Recommendation using MAJORS bobot
====================================================== */

function normalizeWeights(wmap){
  const keys = Object.keys(wmap);
  const sum = keys.reduce((a,k)=>a + (wmap[k]||0),0) || 1;
  const out = {};
  keys.forEach(k=> out[k] = (wmap[k]||0)/sum);
  return out;
}

function computeRecommendations(){
  const cs = catScores(); // object cat->0..1
  const items = MAJORS.map(([name,wmap])=>{
    const W = normalizeWeights(wmap);
    let s = 0;
    for(const k of Object.keys(W)){
      s += (W[k]||0) * (cs[k]||0);
    }
    return { name, score: s, weights: W };
  }).sort((a,b)=>b.score - a.score);
  return { items, cs };
}

/* ======================================================
RENDER KPI + RECOMMENDATIONS + CHART
====================================================== */

let radarChart = null;
function renderKPI(cs){
  const box = $("#kpiGrid");
  if(!box) return;
  box.innerHTML = "";
  CATS.forEach(c=>{
    const val = Math.round((cs[c]||0)*1000)/10; // 0..100 with 1dp
    const el = document.createElement("div");
    el.className = "kpi-item";
    el.innerHTML = `
      <div><h4>${CAT_LABEL[c]}</h4></div>
      <div class="kpi-score">${val}<span class="mini">/100</span></div>
      <div class="kpi-bar"><div class="kpi-fill" style="width:${Math.max(4, val)}%"></div></div>
    `;
    box.appendChild(el);
  });
}

function renderRecommendationsList(items){
  const box = $("#recList");
  if(!box) return;
  const top = items.slice(0,20);
  box.innerHTML = top.map((it,i)=>{
    const pct = Math.round(it.score*1000)/10; // display like 87.5
    return `
      <div class="rec-item">
        <div class="rec-top">
          <span class="rec-rank">${i+1}</span>
          <span class="rec-name">${escapeHtml(it.name)}</span>
          <span class="rec-score">${pct}/100</span>
        </div>
        <div class="rec-bar"><div class="rec-fill" style="width:${Math.max(3,pct)}%"></div></div>
      </div>
    `;
  }).join("");
}

function renderChart(cs){
  const ctx = document.getElementById("clusterChart");
  if(!ctx) return;
  const labels = CATS.map(c => CAT_LABEL[c]);
  const data = CATS.map(c=> Math.round((cs[c]||0)*1000)/10);
  if(window.Chart && radarChart) radarChart.destroy();
  if(!window.Chart) return; // Chart.js not loaded
  radarChart = new Chart(ctx, {
    type: "radar",
    data: {
      labels,
      datasets: [{
        label: "Skor Klaster",
        data,
        backgroundColor: "rgba(92,200,255,0.12)",
        borderColor: "rgba(92,200,255,0.9)",
        pointBackgroundColor: "rgba(92,200,255,0.95)",
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      scales: {
        r: {
          grid: { color: "rgba(255,255,255,0.06)" },
          angleLines: { color: "rgba(255,255,255,0.06)" },
          pointLabels: { color: "#cfe6ff" },
          ticks: { color: "#9fb6df", stepSize: 20, backdropColor: "transparent" }
        }
      },
      plugins: { legend: { labels: { color: "#e6f3ff" } } }
    }
  });
}

/* ======================================================
UI ACTIONS
====================================================== */

function runCalcAndRender(){
  const { items, cs } = computeRecommendations();
  renderKPI(cs);
  renderRecommendationsList(items);
  renderChart(cs);
  toast("✅ Perhitungan selesai — lihat rekomendasi & grafik.");
  saveSession();
}

/* helper: escape HTML in values to avoid injection when inserting raw text */
function escapeHtml(unsafe){
  return String(unsafe)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/* bind UI buttons safely (if elements exist) */
const btnRun = $("#btnRun");
if(btnRun) btnRun.onclick = runCalcAndRender;

const btnFill = $("#btnFill");
if(btnFill) btnFill.onclick = ()=>{
  // fill sample values for many mapel (at least 14)
  const fill = {
    "Matematika Wajib":[85,86,88,90,92],
    "Matematika Lanjutan (Peminatan)":[82,84,86,90,93],
    "Fisika":[84,85,87,90,92],
    "Kimia":[83,85,86,88,90],
    "Biologi":[86,87,88,90,91],
    "Ekonomi":[82,83,85,87,90],
    "Sosiologi":[80,82,84,86,88],
    "Geografi":[81,83,84,86,89],
    "Bahasa Indonesia":[84,85,86,88,90],
    "Bahasa Inggris":[82,84,86,88,90],
    "Bahasa Daerah":[80,82,84,86,88],
    "Informatika/TIK":[85,86,88,91,94],
    "Seni Budaya":[80,82,83,85,87],
    "Sejarah Indonesia":[80,81,83,85,86],
    "Pendidikan Agama":[78,80,82,84,86]
  };
  rows.forEach(r=>{
    if(fill[r.name]) r.s = fill[r.name].slice();
  });
  renderTable();
  saveSession();
  toast("✨ Contoh nilai terisi.");
};

const btnAddRow = $("#btnAddRow");
if(btnAddRow) btnAddRow.onclick = ()=>{ addRow("Mapel Kustom","UMUM",["","","","",""], false); renderTable(); saveSession(); };

const btnSave = $("#btnSave");
if(btnSave) btnSave.onclick = ()=> saveLocal();

const btnLoad = $("#btnLoad");
if(btnLoad) btnLoad.onclick = ()=> loadLocal();

const btnReset = $("#btnReset");
if(btnReset) btnReset.onclick = ()=> { if(confirm("Reset ke daftar mapel default?")){ loadDefaults(); renderTable(); saveSession(); toast("♻️ Reset selesai."); } };

/* Download JSON */
const btnDownloadJSON = $("#btnDownloadJSON");
if(btnDownloadJSON) btnDownloadJSON.onclick = ()=>{
  const blob = new Blob([JSON.stringify(rows,null,2)], {type:"application/json"});
  const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "nilai-rapor-snbp.json"; a.click(); URL.revokeObjectURL(a.href);
};

/* ======================================================
UPLOAD XLS / XLSX (SheetJS)
Expect columns: Nama Mapel, Kategori, S1..S5
====================================================== */

const fileUpload = $("#fileUpload");
if(fileUpload){
  fileUpload.addEventListener("change", async (ev)=>{
    const f = ev.target.files[0];
    if(!f) return;
    const name = f.name.toLowerCase();
    if(!(name.endsWith(".xls") || name.endsWith(".xlsx"))){
      toast("⚠️ Harap unggah file .xls atau .xlsx"); ev.target.value=""; return;
    }
    try{
      const data = await f.arrayBuffer();
      const wb = XLSX.read(data);
      const first = wb.Sheets[wb.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json(first, {header:1, defval:""});
      // Parse rows: expecting header in row 0 optionally
      const parsed = [];
      for(let i=0;i<json.length;i++){
        const row = json[i];
        if(!row || row.length===0) continue;
        if(i===0){
          const header = row.join(" ").toLowerCase();
          if(header.includes("nama") || header.includes("mapel") || header.includes("mata")){
            continue; // skip header
          }
        }
        const nameMapel = (row[0]||"").toString().trim();
        const cat = ((row[1]||"UMUM").toString().trim()).toUpperCase();
        if(!nameMapel) continue;
        const catNorm = CATS.includes(cat) ? cat : "UMUM";
        const s1 = row[2]===""? "" : Number(row[2]);
        const s2 = row[3]===""? "" : Number(row[3]);
        const s3 = row[4]===""? "" : Number(row[4]);
        const s4 = row[5]===""? "" : Number(row[5]);
        const s5 = row[6]===""? "" : Number(row[6]);
        parsed.push([nameMapel, catNorm, [s1,s2,s3,s4,s5]]);
      }
      if(parsed.length===0){ toast("⚠️ File terdeteksi kosong atau format tidak sesuai."); ev.target.value=""; return; }
      // replace rows with parsed (keep category paten if matches)
      rows = [];
      parsed.forEach(([n,c,arr])=>{
        const catU = CATS.includes(c) ? c : "UMUM";
        addRow(n, catU, arr, false);
      });
      // also ensure default subjects that not present are appended (so table still has core mapel)
      DEFAULT_SUBJECTS.forEach(([n,c])=>{
        if(!rows.some(r=>r.name.toLowerCase()===n.toLowerCase())){
          addRow(n,c,["","","","",""], true);
        }
      });
      renderTable(); saveSession();
      toast("✅ Impor XLS berhasil.");
      ev.target.value = "";
    }catch(err){
      console.error(err); toast("❌ Gagal baca file XLS."); ev.target.value = "";
    }
  });
}

/* ======================================================
TOAST
====================================================== */
function toast(msg){
  const t = document.createElement("div");
  t.className = "toast";
  t.textContent = msg;
  Object.assign(t.style, {
    position:"fixed", left:"50%", transform:"translateX(-50%)",
    bottom:"18px", background:"#0e1730", color:"#eaf6ff", padding:"10px 14px",
    border:"1px solid rgba(100,130,200,0.12)", borderRadius:"10px", zIndex:9999
  });
  document.body.appendChild(t);
  setTimeout(()=>t.remove(),2200);
}

/* ======================================================
INIT
====================================================== */
function boot(){
  catLegend();
  loadDefaults();
  loadSession(); // prefer session if exist
  // if loadSession replaced rows, don't overwrite with defaults; logic above loads defaults then session overwrites
  renderTable();
}
function catLegend(){
  // show badges (not editable)
  const legendHolder = document.createElement("div");
  legendHolder.style.marginTop = "8px";
  CATS.forEach(c=>{
    const s = document.createElement("span");
    s.className = "badge mini";
    s.textContent = c;
    s.style.marginRight = "6px";
    legendHolder.appendChild(s);
  });
  // append near top
  const panel = document.querySelector(".panel");
  if(panel){
    const head = panel.querySelector(".panel-head");
    if(head) head.appendChild(legendHolder);
  }
}

boot();
