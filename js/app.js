// ==============================
// NOSPLAY — App.js Completo
// ==============================

let currentCat = "Todos";
let currentSlide = 0;
let currentShots = [];
let currentAppName = null;
let showAllComments = false;

// ==============================
// PEGAR USUÁRIO LOGADO
// ==============================
function getCurrentUser() {
  return firebase.auth().currentUser;
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

  // Renderiza detalhes do app
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
      <div class="stars" id="rating-stars"></div>
      <small id="rating-msg"></small>
    </div>

    <div class="comments">
      <h3>Comentários</h3>
      <textarea id="ctext" placeholder="Escreva um comentário"></textarea>
      <button onclick="sendComment()">Enviar</button>
      <div id="comments-list"></div>
    </div>
  `;

  renderStars();
  updateMainData();
  loadComments();

  // BOTÃO DE DOWNLOAD
  const installBtn = document.getElementById("install-btn");
  if (installBtn) {
    installBtn.onclick = () => {
      if (!a.apk) { alert("Link do APK não disponível!"); return; }
      window.location.href = a.apk;
      if (typeof db !== "undefined") {
        const downloadsRef = db.ref(`apps/${a.nome}/downloads`);
        downloadsRef.transaction(current => (current || 0) + 1);
      }
      updateProgress(100);
    };
  }

  window.scrollTo(0,0);
}

// ==============================
// ESTRELAS
// ==============================
function renderStars(){
  const starsBox = document.getElementById("rating-stars");
  if(!starsBox) return;
  const currentUser = getCurrentUser();
  starsBox.innerHTML = "";
  for(let i=1;i<=5;i++){
    const star = document.createElement("span");
    star.textContent = "★";
    star.onclick = () => {
      if(!currentUser){
        alert("Faça login para avaliar!");
        return;
      }
      saveRating(currentAppName, i);
      updateMainData();
      Array.from(starsBox.children).forEach((s,j)=>{
        s.classList.toggle("active", j<i);
      });
      document.getElementById("rating-msg").innerText = `Você avaliou ${i}☆`;
    };
    starsBox.appendChild(star);
  }

  // Carregar rating existente do usuário
  if(currentUser && typeof db!=="undefined"){
    db.ref(`ratings/${currentAppName}`).orderByKey().equalTo(currentUser.uid).once("value",snap=>{
      snap.forEach(s=>{
        const val = s.val();
        Array.from(starsBox.children).forEach((s,j)=>{
          s.classList.toggle("active", j<val.value);
        });
      });
    });
  }
}

function saveRating(appName, value){
  const user = getCurrentUser();
  if(!user || typeof db==="undefined") return;
  db.ref(`ratings/${appName}/${user.uid}`).set({value});
}

// ==============================
// COMENTÁRIOS
// ==============================
function sendComment(){
  const ctext = document.getElementById("ctext");
  if(!ctext.value) return alert("Digite algo!");

  const user = getCurrentUser();
  if(!user) return alert("Faça login para comentar!");

  const starsBox = document.getElementById("rating-stars");
  const ratingValue = Array.from(starsBox.children).filter(s=>s.classList.contains("active")).length;

  const commentsRef = db.ref(`comments/${currentAppName}`);
  
  // Checa se já comentou
  commentsRef.orderByChild("email").equalTo(user.email).once("value", snap=>{
    const commentData = {
      email: user.email,
      text: ctext.value.trim(),
      rating: ratingValue,
      time: Date.now()
    };

    if(snap.exists()){
      snap.forEach(s=>{
        commentsRef.child(s.key).update(commentData).then(()=>{ ctext.value=""; loadComments(); });
      });
    } else {
      commentsRef.push(commentData).then(()=>{ ctext.value=""; loadComments(); });
    }
  });
}

function loadComments(){
  const list = document.getElementById("comments-list");
  if(!list) return;
  const currentUser = getCurrentUser();

  db.ref(`comments/${currentAppName}`).once("value",snap=>{
    const comments = [];
    snap.forEach(s=>comments.push({key:s.key, ...s.val()}));

    const toShow = showAllComments ? comments.length : Math.min(3, comments.length);

    list.innerHTML="";
    for(let i=0;i<toShow;i++){
      const c = comments[i];
      const date = new Date(c.time||0);
      const formattedDate = `${date.getDate().toString().padStart(2,'0')}/`+
                            `${(date.getMonth()+1).toString().padStart(2,'0')}/`+
                            `${date.getFullYear()} ${date.getHours().toString().padStart(2,'0')}:`+
                            `${date.getMinutes().toString().padStart(2,'0')}`;
      const starsHTML = "★".repeat(c.rating)+"☆".repeat(5-c.rating);
      const isCurrentUser = currentUser && c.email===currentUser.email;
      list.innerHTML += `
        <div class="comment" style="${isCurrentUser?'border:1px solid #1e88e5; padding:8px;':''}">
          <strong>${c.email}</strong><br>
          <span style="color:#f5c26b; font-size:16px;">${starsHTML}</span>
          <p>${c.text}</p>
          <small style="color:#aaa;">${formattedDate}</small>
          ${isCurrentUser?'<button onclick="editComment(\''+c.key+'\')">Editar</button>':''}
        </div>
      `;
    }

    if(comments.length>3){
      const btn = document.createElement("button");
      btn.textContent = showAllComments?"Ver menos":`Ver mais (${comments.length-3} restantes)`;
      btn.style.marginTop="10px";
      btn.style.width="100%";
      btn.onclick = ()=>{
        showAllComments=!showAllComments;
        loadComments();
      };
      list.appendChild(btn);
    }
  });
}

function editComment(key){
  const user = getCurrentUser();
  if(!user) return;

  db.ref(`comments/${currentAppName}/${key}`).once("value",snap=>{
    const c = snap.val();
    if(!c) return;
    document.getElementById("ctext").value = c.text;

    const starsBox = document.getElementById("rating-stars");
    if(starsBox){
      Array.from(starsBox.children).forEach((s,i)=>{
        s.classList.toggle("active", i<c.rating);
      });
    }

    const btn = document.querySelector(".comments button");
    if(btn) btn.textContent = "Editar";
  });
}

// ==============================
// BARRA DE PROGRESSO
// ==============================
function updateProgress(pct){
  const barra = document.getElementById("download-progress");
  if(!barra) return;
  barra.style.display="block";
  barra.style.width = pct+"%";
  barra.innerText = pct<100?`Baixando… ${pct}%`:"✅ Download concluído!";
  if(pct===100) setTimeout(()=>barra.style.display="none",1500);
}

// ==============================
// NAV / LIGHTBOX
// ==============================
function goHome(){
  document.getElementById("home").style.display="block";
  document.getElementById("details").style.display="none";
  document.getElementById("about").style.display="none";
  history.pushState({ page:"home" },"","#home");
}

function openAbout(){
  document.getElementById("home").style.display="none";
  document.getElementById("details").style.display="none";
  document.getElementById("about").style.display="block";
  history.pushState({ page:"about" },"","#about");
}

function openLightbox(i){
  if(!currentAppName) return;
  const app = appsData.find(a=>a.nome===currentAppName);
  if(!app || !app.shots.length) return;
  currentShots = app.shots;
  currentSlide = i;
  const lightbox = document.getElementById("lightbox");
  document.getElementById("lightbox-img").src = currentShots[i];
  lightbox.style.display="flex";
  history.pushState({ page:"lightbox" },"","#lightbox");
}

function closeLightbox(){
  const lightbox = document.getElementById("lightbox");
  if(lightbox) lightbox.style.display="none";
}

function nextSlide(){
  if(!currentShots.length) return;
  currentSlide=(currentSlide+1)%currentShots.length;
  document.getElementById("lightbox-img").src=currentShots[currentSlide];
}

function prevSlide(){
  if(!currentShots.length) return;
  currentSlide=(currentSlide-1+currentShots.length)%currentShots.length;
  document.getElementById("lightbox-img").src=currentShots[currentSlide];
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
    const avg = val.votes?(val.stars/val.votes).toFixed(1):0;
    const el = document.getElementById("rating-main");
    if(el) el.textContent=avg+"☆";
  });
}

// ==============================
// INIT
// ==============================
renderCategories();
renderApps();
window.onload = ()=>{ window.scrollTo(0,0); };

// BLOQUEAR PINÇA (2 dedos)
document.addEventListener('touchstart', function(e){
  if(e.touches.length>1) e.preventDefault();
},{passive:false});

// BLOQUEAR DUPLO TOQUE
let lastTouchEnd = 0;
document.addEventListener('touchend', function(e){
  const now = Date.now();
  if(now-lastTouchEnd<=300) e.preventDefault();
  lastTouchEnd=now;
},false);

function enviarCoordenadas() {
  const btn = document.getElementById("install-btn");
  if (!btn) return;
  
  const rect = btn.getBoundingClientRect();
  
  if (window.AndroidInterface) {
    // coloca a barra 5px abaixo do botão
    window.AndroidInterface.setBarPosition(rect.bottom + 5, rect.left, rect.width, 24);
  }
}

// Chama quando a página ou a lista de apps carregar
window.onload = () => enviarCoordenadas();
