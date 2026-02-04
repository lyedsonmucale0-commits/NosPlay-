let currentCat = "Todos";

const appsData = [
  {
    nome: "HolyPlay DEMO",
    categoria: "Educação",
    versao: "1.0.0",
    tamanho: "32 MB",
    desc:"HolyPlay DEMO é um aplicativo cristão projetado para oferecer uma experiência completa de entretenimento e aprendizado, reunindo conteúdos diversos que inspiram, desafiam e entretêm de maneira segura e intuitiva. Desenvolvido para jovens e adultos, o app busca unir diversão e reflexão, permitindo que cada usuário explore seu próprio caminho de descoberta espiritual e pessoal.",
    icon: "https://i.imgur.com/4Z9UNwL.png",
    shots: [
   "https://i.imgur.com/vKuE823.jpeg",
   "https://i.imgur.com/18bFIN2.jpeg",
   "https://i.imgur.com/qyBzUaE.jpeg",
   "https://i.imgur.com/FVzr421.jpeg",
   "https://i.imgur.com/xh4gX3h.jpeg",
   "https://i.imgur.com/Aq8zr3O.jpeg",
   "https://i.imgur.com/vD5udWA.jpeg",
   "https://i.imgur.com/Zi5kAjp.jpeg",
    ],
    link: "https://github.com/lyedsonmucale0-commits/HolyPlay/releases/download/V1.2/HolyPlay.apk"
  }
];

function renderCategories(){
  const cats = ["Todos", ...new Set(appsData.map(a => a.categoria))];
  const box = document.getElementById("cats");
  box.innerHTML = "";
  cats.forEach(c => {
    box.innerHTML += `<div class="cat ${c===currentCat?'active':''}" onclick="setCat('${c}')">${c}</div>`;
  });
}

function setCat(c){
  currentCat = c;
  renderCategories();
  renderApps();
}

function renderApps(){
  const q = search.value.toLowerCase();
  apps.innerHTML = "";
  appsData
    .filter(a => currentCat==="Todos" || a.categoria===currentCat)
    .filter(a => a.nome.toLowerCase().includes(q))
    .forEach(a => {
      apps.innerHTML += `
      <div class="app" onclick="openApp('${a.nome}')">
        <img src="${a.icon}">
        <div class="app-name">${a.nome}</div>
        <div class="app-meta">${a.categoria}</div>
      </div>`;
    });
}

function openApp(nome){
  const a = appsData.find(x => x.nome === nome);
  home.style.display="none";
  details.style.display="block";
  details.innerHTML = `
    <div class="back" onclick="goHome()">← Voltar</div>
    <div class="details-top">
      <img src="${a.icon}">
      <div>
        <h2>${a.nome}</h2>
        <small>${a.categoria}</small>
      </div>
    </div>
    <div class="install" onclick="location.href='${a.link}'">INSTALAR</div>
    <div class="screens">
      ${a.shots.map(s=>`<img src="${s}" onclick="openLightbox('${s}')">`).join("")}
    </div>
    <div class="desc">${a.desc}</div>
  `;
  window.scrollTo(0,0);
}

function openAbout(){
  home.style.display="none";
  about.style.display="block";
}

function goHome(){
  home.style.display="block";
  details.style.display="none";
  about.style.display="none";
}

function openLightbox(src){
  const lb = document.getElementById("lightbox");
  document.getElementById("lightbox-img").src = src;
  lb.style.display = "flex";
}

function closeLightbox(){
  document.getElementById("lightbox").style.display = "none";
}

renderCategories();
renderApps();
