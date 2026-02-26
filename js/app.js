// ==============================
// NOSPLAY — App.js (Final Corrigido)
// ==============================

let currentCat = "Todos";
let currentSlide = 0;
let currentShots = [];
let currentAppName = null;

// ==============================
// USUÁRIO ANÔNIMO
// ==============================
let userId = localStorage.getItem("nosplay_uid");
if (!userId) {
  userId = "u_" + Math.random().toString(36).substr(2, 9);
  localStorage.setItem("nosplay_uid", userId);
}

// ==============================
// APPS DE EXEMPLO / EXTERNOS
// ==============================
const appsData = window.NosPlayApps || [];
if (!appsData.length) console.warn("Nenhum app carregado.");

// ==============================
// CATEGORIAS
// ==============================
function renderCategories() {
  const cats = ["Todos", ...new Set(appsData.map(a => a.categoria))];
  const box = document.getElementById("cats");
  if (!box) return;
  box.innerHTML = "";
  cats.forEach(c => {
    const div = document.createElement("div");
    div.className = "cat" + (c === currentCat ? " active" : "");
    div.innerText = c;
    div.onclick = () => setCat(c);
    box.appendChild(div);
  });
}

function setCat(c) {
  currentCat = c;
  renderCategories();
  renderApps();
}

// ==============================
// LISTA DE APPS
// ==============================
function renderApps() {
  const searchInput = document.getElementById("search");
  const q = searchInput ? searchInput.value.toLowerCase() : "";
  const apps = document.getElementById("apps");
  if (!apps) return;
  apps.innerHTML = "";

  appsData
    .filter(a => currentCat === "Todos" || a.categoria === currentCat)
    .filter(a => a.nome.toLowerCase().includes(q))
    .forEach(a => {
      const appEl = document.createElement("div");
      appEl.className = "app";
      appEl.onclick = () => openApp(a.nome);
      appEl.innerHTML = `
        <img src="${a.icon}">
        <div class="app-name">${a.nome}</div>
        <div class="app-meta">${a.categoria}</div>
        <div class="app-info">
          <div id="rating-${a.nome}">0☆</div>
          <div>${a.tamanho}</div>
          <div style="display:flex;align-items:center;gap:4px;">
            <svg xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 0 24 24" width="20" fill="#1e88e5">
              <path d="M0 0h24v24H0z" fill="none"/>
              <path d="M5 20h14v-2H5v2zm7-18l-5 5h3v6h4v-6h3l-5-5z"/>
            </svg>
            <span id="downloads-${a.nome}">0</span>
          </div>
        </div>
      `;
      apps.appendChild(appEl);

      // Atualiza downloads
      if (typeof db !== "undefined") {
        db.ref(`apps/${a.nome}/downloads`).once("value", snap => {
          const val = snap.val() || 0;
          const el = document.getElementById(`downloads-${a.nome}`);
          if (el) el.textContent = val.toLocaleString();
        });

        // Atualiza rating
        db.ref(`apps/${a.nome}/rating`).once("value", snap => {
          const val = snap.val() || { stars: 0, votes: 0 };
          const avg = val.votes ? (val.stars / val.votes).toFixed(1) : 0;
          const el = document.getElementById(`rating-${a.nome}`);
          if (el) el.textContent = avg + "☆";
        });
      }
    });

  checkScroll();
}

// ==============================
// BLOQUEIO SCROLL SE POUCOS APPS
// ==============================
function checkScroll() {
  const homeSection = document.getElementById("home");
  if (!homeSection) return;
  document.body.style.overflow = homeSection.scrollHeight <= window.innerHeight ? "hidden" : "auto";
}

// ==============================
// DETALHES DO APP
// ==============================
function openApp(name) {
  const a = appsData.find(x => x.nome === name);
  if (!a) return;
  currentAppName = name;

  const home = document.getElementById("home");
  const details = document.getElementById("details");
  if (!home || !details) return;

  home.style.display = "none";
  details.style.display = "block";

  // Renderiza detalhes
  details.innerHTML = `
    <div class="back" onclick="goHome()">← Voltar</div>
    <div class="details-top">
      <img src="${a.icon}">
      <div>
        <h2>${a.nome}</h2>
        <small>${a.categoria}</small>
      </div>
    </div>

    <div class="app-info">
      <div id="rating-main">0☆</div>
      <div>${a.tamanho}</div>
      <div style="display:flex;align-items:center;gap:4px;" id="downloads-wrapper-main">
        <svg xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 0 24 24" width="20" fill="#1e88e5">
          <path d="M0 0h24v24H0z" fill="none"/>
          <path d="M5 20h14v-2H5v2zm7-18l-5 5h3v6h4v-6h3l-5-5z"/>
        </svg>
        <span id="downloads-main">0</span>
      </div>
    </div>

    <div class="install" id="install-btn">INSTALAR</div>

    <div id="download-progress" style="
        display:none;
        width:0%;
        height:24px;
        background:#2962ff;
        color:white;
        text-align:center;
        line-height:24px;
        border-radius:4px;
        margin:10px 0;
    "></div>

    <div class="screens">
      ${a.shots.map((s,i)=>`<img src="${s}" onclick="openLightbox(${i})">`).join("")}
    </div>

    <div class="rating-box">
      <h3>Avaliar este app</h3>
      <div class="stars" id="rating-stars">
        ${[1,2,3,4,5].map(n=>`<span onclick="rateApp(${n})">★</span>`).join("")}
      </div>
      <small id="rating-msg"></small>
    </div>

    <div class="comments">
      <h3>Comentários</h3>
      <input id="cname" placeholder="Seu nome">
      <textarea id="ctext" placeholder="Escreva um comentário"></textarea>
      <button onclick="sendComment()">Enviar</button>
      <div id="comments-list"></div>
    </div>
  `;

  // ==============================
  // BOTÃO DE DOWNLOAD GLOBAL
  // ==============================
  // ==============================
// BOTÃO DE DOWNLOAD GLOBAL
// ==============================
const installBtn = document.getElementById("install-btn");
if (installBtn) {
  installBtn.onclick = () => {
    if (!a.apk) {
      alert("Link do APK não disponível!");
      return;
    }

    // Inicia download direto
    window.location.href = a.apk;

    // Atualiza contador de downloads no Firebase
    if (typeof db !== "undefined") {
      const downloadsRef = db.ref(`apps/${a.nome}/downloads`);
      downloadsRef.transaction(current => (current || 0) + 1);
    }

    // Atualiza barra de progresso (opcional)
    updateProgress(100);
  };
}

  window.scrollTo(0,0);
  updateMainData();
  loadComments();
}


// ==============================
// BARRA DE PROGRESSO (para AndroidBridge, opcional)
// ==============================
function updateProgress(pct) {
  const barra = document.getElementById("download-progress");
  if (!barra) return;
  barra.style.display = "block";
  if (pct > 100) pct = 100;
  barra.style.width = pct + "%";
  barra.innerText = `Baixando… ${pct}%`;
  if (pct === 100) {
    barra.innerText = "✅ Download concluído!";
    setTimeout(() => barra.style.display="none", 1500);
  }
}

// ==============================
// FUNÇÕES DE NAVEGAÇÃO / LIGHTBOX
// ==============================
function goHome() {
  document.getElementById("home").style.display="block";
  document.getElementById("details").style.display="none";
  document.getElementById("about").style.display="none";
  history.pushState({ page:"home" },"","#home");
}

function openAbout() {
  document.getElementById("home").style.display="none";
  document.getElementById("details").style.display="none";
  document.getElementById("about").style.display="block";
  history.pushState({ page:"about" },"","#about");
}

function openLightbox(i) {
  if (!currentAppName) return;
  const app = appsData.find(a=>a.nome===currentAppName);
  if (!app || !app.shots.length) return;
  currentShots = app.shots;
  currentSlide = i;
  const lightbox = document.getElementById("lightbox");
  document.getElementById("lightbox-img").src = currentShots[i];
  lightbox.style.display="flex";
  history.pushState({ page:"lightbox" },"","#lightbox");
}

function closeLightbox() {
  const lightbox = document.getElementById("lightbox");
  if(lightbox) lightbox.style.display="none";
}

function nextSlide() {
  if (!currentShots.length) return;
  currentSlide = (currentSlide+1)%currentShots.length;
  document.getElementById("lightbox-img").src = currentShots[currentSlide];
}

function prevSlide() {
  if (!currentShots.length) return;
  currentSlide = (currentSlide-1+currentShots.length)%currentShots.length;
  document.getElementById("lightbox-img").src = currentShots[currentSlide];
}

// ==============================
// RATINGS
// ==============================
let selectedRating = 0;
function rateApp(value){
  db.ref(`ratings/${currentAppName}/${userId}`).set({ value }).then(()=>{
    const msg = document.getElementById("rating-msg");
    if(msg) msg.innerText="Avaliação enviada ⭐";
    highlightStars(value);
    updateAverageRating(currentAppName);
  });
}

function highlightStars(v){
  document.querySelectorAll("#rating-stars span")
    .forEach((s,i)=>s.style.color=i<v?"#f5c26b":"#555");
}

function updateAverageRating(appName){
  db.ref(`ratings/${appName}`).once("value", snap=>{
    let total=0, count=0;
    snap.forEach(s=>{ total+=s.val().value; count++; });
    db.ref(`apps/${appName}/rating`).set({ stars:total, votes:count });
    updateMainData();
    renderApps();
  });
}

// ==============================
// COMENTÁRIOS
// ==============================
function sendComment(){
  const cname = document.getElementById("cname");
  const ctext = document.getElementById("ctext");
  if(!ctext.value) return;
  db.ref(`comments/${currentAppName}`).push({
    name: cname.value||"Anônimo",
    text: ctext.value,
    time: Date.now()
  });
  ctext.value="";
}

function loadComments(){
  const list = document.getElementById("comments-list");
  if(!list) return;
  db.ref(`comments/${currentAppName}`).on("value", snap=>{
    list.innerHTML="";
    snap.forEach(s=>{
      const c = s.val();
      const likes = c.likes ? Object.keys(c.likes).length : 0;
      list.innerHTML += `
        <div class="comment">
          <strong>${c.name}</strong>
          <p>${c.text}</p>
          <button onclick="likeComment('${s.key}')">👍 ${likes}</button>
        </div>
      `;
    });
  });
}

function likeComment(id){
  const ref = db.ref(`comments/${currentAppName}/${id}/likes/${userId}`);
  ref.once("value", s => s.exists() ? ref.remove() : ref.set(true));
}

// ==============================
// ATUALIZA RATINGS + DOWNLOADS
// ==============================
function updateMainData(){
  db.ref(`apps/${currentAppName}/downloads`).once("value", snap=>{
    const el = document.getElementById("downloads-main");
    if(el) el.textContent=(snap.val()||0).toLocaleString();
  });

  db.ref(`apps/${currentAppName}/rating`).once("value", snap=>{
    const val = snap.val()||{stars:0,votes:0};
    const avg = val.votes? (val.stars/val.votes).toFixed(1):0;
    const el = document.getElementById("rating-main");
    if(el) el.textContent=avg+"☆";
  });
}

// ==============================
// INIT
// ==============================
renderCategories();
renderApps();
window.onload = () => { window.scrollTo(0,0); };
