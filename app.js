// ==============================
// NOSPLAY — App.js (Corrigido SVG Download)
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
// APPS DE EXEMPLO
// ==============================
const appsData = [
  {
    nome: "HolyPlay DEMO",
    categoria: "Educação",
    versao: "3.1.0",
    tamanho: "32MB",
    desc: "HolyPlay DEMO é um aplicativo cristão projetado para oferecer uma experiência completa de entretenimento e aprendizado.",
    icon: "https://i.imgur.com/4Z9UNwL.png",
    shots: [
      "https://i.imgur.com/vKuE823.jpeg",
      "https://i.imgur.com/18bFIN2.jpeg",
      "https://i.imgur.com/qyBzUaE.jpeg",
      "https://i.imgur.com/FVzr421.jpeg",
      "https://i.imgur.com/xh4gX3h.jpeg",
      "https://i.imgur.com/Aq8zr3O.jpeg",
      "https://i.imgur.com/vD5udWA.jpeg",
      "https://i.imgur.com/Zi5kAjp.jpeg"
    ],
    link: "https://nosplay.netlify.app/.netlify/functions/download?file=HolyPlay.apk"
  }
];

// ==============================
// CATEGORIAS
// ==============================
function renderCategories() {
  const cats = ["Todos", ...new Set(appsData.map(a => a.categoria))];
  const box = document.getElementById("cats");
  if (!box) return;
  box.innerHTML = "";
  cats.forEach(c => {
    box.innerHTML += `<div class="cat ${c === currentCat ? "active" : ""}" onclick="setCat('${c}')">${c}</div>`;
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
          <div style="display:flex;align-items:center;gap:4px;" id="downloads-wrapper-${a.nome}">
            <svg xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 0 24 24" width="20" fill="#1e88e5">
              <path d="M0 0h24v24H0z" fill="none"/>
              <path d="M5 20h14v-2H5v2zm7-18l-5 5h3v6h4v-6h3l-5-5z"/>
            </svg>
            <span id="downloads-${a.nome}">0</span>
          </div>
        </div>
      `;
      apps.appendChild(appEl);

      // BUSCAR DOWNLOADS REAIS
      db.ref(`apps/${a.nome}/downloads`).once("value", snap => {
        const val = snap.val() || 0;
        const el = document.getElementById(`downloads-${a.nome}`);
        if (el) el.textContent = val.toLocaleString();
      });

      // BUSCAR AVALIAÇÃO MÉDIA
      db.ref(`apps/${a.nome}/rating`).once("value", snap => {
        const val = snap.val() || { stars: 0, votes: 0 };
        const avg = val.votes ? (val.stars / val.votes).toFixed(1) : 0;
        const el = document.getElementById(`rating-${a.nome}`);
        if (el) el.textContent = avg + "☆";
      });
    });

  window.scrollTo(0, 0);
  checkScroll();
}

// ==============================
// BLOQUEAR SCROLL SE POUCOS APPS
// ==============================
function checkScroll() {
  const homeSection = document.getElementById("home");
  if (!homeSection) return;
  if (homeSection.scrollHeight <= window.innerHeight) {
    document.body.style.overflow = "hidden"; 
  } else {
    document.body.style.overflow = "auto"; 
  }
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

    <div class="install" onclick="installApp('${a.nome}','${a.link}')">INSTALAR</div>

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

  history.pushState({ page: "details", app: name }, "", "#details");
// ==============================
// INSTALL APP (GLOBAL)
// ==============================
window.installApp = function (appName, link) {
  // Incrementa downloads
  db.ref(`apps/${appName}/downloads`)
    .transaction(current => (current || 0) + 1);

  alert(
    "📦 O download será aberto no navegador.\n\n" +
    "Após baixar, instale o aplicativo manualmente."
  );

  window.open(link, "_blank");
};

  window.scrollTo(0,0);
  updateMainData();
  loadComments();
}

// ==============================
// FUNÇÕES DE NAVEGAÇÃO
// ==============================
function goHome() {
  const home = document.getElementById("home");
  const details = document.getElementById("details");
  const about = document.getElementById("about");
  if(home) home.style.display="block";
  if(details) details.style.display="none";
  if(about) about.style.display="none";

  history.pushState({ page: "home" }, "", "#home");
}

function openAbout() {
  const home = document.getElementById("home");
  const details = document.getElementById("details");
  const about = document.getElementById("about");
  if(home) home.style.display="none";
  if(details) details.style.display="none";
  if(about) about.style.display="block";

  history.pushState({ page: "about" }, "", "#about");
}

// ==============================
// LIGHTBOX
// ==============================
function openLightbox(i) {
  if (!currentAppName) return;
  currentSlide = i;
  const app = appsData.find(a => a.nome === currentAppName);
  if (!app || !app.shots.length) return;

  currentShots = app.shots;
  const lightbox = document.getElementById("lightbox");
  const img = document.getElementById("lightbox-img");
  if (!lightbox || !img) return;

  lightbox.style.display = "flex";
  img.src = currentShots[i];

  history.pushState({ page: "lightbox" }, "", "#lightbox");
}

function closeLightbox() {
  const lightbox = document.getElementById("lightbox");
  if (lightbox) lightbox.style.display = "none"; // apenas fecha o lightbox
}

function nextSlide() {
  if (!currentShots.length) return;
  currentSlide = (currentSlide + 1) % currentShots.length;
  const img = document.getElementById("lightbox-img");
  if (img) img.src = currentShots[currentSlide];
}

function prevSlide() {
  if (!currentShots.length) return;
  currentSlide = (currentSlide - 1 + currentShots.length) % currentShots.length;
  const img = document.getElementById("lightbox-img");
  if (img) img.src = currentShots[currentSlide];
}

window.addEventListener("keydown", (e) => {
  const lightbox = document.getElementById("lightbox");
  if (!lightbox || lightbox.style.display !== "flex") return;

  if (e.key === "Escape") closeLightbox();
  if (e.key === "ArrowRight") nextSlide();
  if (e.key === "ArrowLeft") prevSlide();
});

// ==============================
// POPSTATE — BOTÃO VOLTAR ANDROID
// ==============================
window.addEventListener("popstate", (event) => {
  const state = event.state;
  const lightbox = document.getElementById("lightbox");

  if(lightbox && lightbox.style.display === "flex"){
    closeLightbox();
    return;
  }

  if(!state || state.page === "home"){
    goHome();
  } else if(state.page === "details"){
    const appName = state.app || currentAppName;
    openApp(appName);
  } else if(state.page === "about"){
    openAbout();
  }
});

// ==============================
// RATINGS
// ==============================
let selectedRating = 0;
function rateApp(value) {
  db.ref(`ratings/${currentAppName}/${userId}`).set({ value })
    .then(()=> {
      const msg = document.getElementById("rating-msg");
      if(msg) msg.innerText = "Avaliação enviada ⭐";
      highlightStars(value);
      updateAverageRating(currentAppName);
    });
}

function highlightStars(v){
  document.querySelectorAll("#rating-stars span")
    .forEach((s,i)=>s.style.color=i<v?"#f5c26b":"#555");
}

function updateAverageRating(appName){
  db.ref(`ratings/${appName}`).once("value", snap => {
    let total = 0, count = 0;
    snap.forEach(s => { total += s.val().value; count++; });
    db.ref(`apps/${appName}/rating`).set({ stars: total, votes: count });
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
  if(!cname || !ctext || !ctext.value) return;

  db.ref(`comments/${currentAppName}`).push({
    name: cname.value || "Anônimo",
    text: ctext.value,
    time: Date.now()
  });
  ctext.value = "";
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
// UPDATE RATINGS + DOWNLOADS
// ==============================
function updateMainData() {
  const downloadsMain = document.getElementById("downloads-main");
  const ratingMain = document.getElementById("rating-main");

  db.ref(`apps/${currentAppName}/downloads`).once("value", snap => {
    if (downloadsMain) downloadsMain.textContent = (snap.val() || 0).toLocaleString();
  });

  db.ref(`apps/${currentAppName}/rating`).once("value", snap => {
    const val = snap.val() || { stars:0, votes:0 };
    const avg = val.votes ? (val.stars/val.votes).toFixed(1) : 0;
    if (ratingMain) ratingMain.textContent = avg + "☆";
  });
}

// ==============================
// INIT
// ==============================
renderCategories();
renderApps();

// ==============================
// GARANTIR QUE O APP COMEÇA NO TOPO
// ==============================
window.onload = () => {
  window.scrollTo(0,0);
};
