// ==============================
// log.js — Login / Registro com feedback
// ==============================
let currentUser = null;

document.addEventListener("DOMContentLoaded", () => {
  
  // ==========================
  // ELEMENTOS
  // ==========================
  const loginSection = document.getElementById("login");
  const registerSection = document.getElementById("register");
  const homeSection = document.getElementById("home");
  
  const loginBtn = document.getElementById("login-btn");
  const googleBtn = document.getElementById("login-google-btn");
  const showRegisterBtn = document.getElementById("show-register");
  const regBtn = document.getElementById("reg-btn");
  const backLoginBtn = document.getElementById("back-to-login");
  
  // Caixas de feedback
  function showLoginMessage(msg, tipo = "erro") {
    let el = document.getElementById("login-msg");
    if (!el) {
      el = document.createElement("div");
      el.id = "login-msg";
      el.style.marginTop = "10px";
      el.style.color = tipo === "erro" ? "#e53935" : "#43a047";
      el.style.fontWeight = "600";
      document.querySelector(".login-box").appendChild(el);
    }
    el.innerText = msg;
  }
  
  function showRegisterMessage(msg, tipo = "erro") {
    let el = document.getElementById("register-msg");
    if (!el) {
      el = document.createElement("div");
      el.id = "register-msg";
      el.style.marginTop = "10px";
      el.style.color = tipo === "erro" ? "#e53935" : "#43a047";
      el.style.fontWeight = "600";
      document.querySelector(".register-box").appendChild(el);
    }
    el.innerText = msg;
  }
  
  // ==========================
  // FUNÇÕES VISUAL
  // ==========================
  function showHome() {
    loginSection.style.display = "none";
    registerSection.style.display = "none";
    homeSection.style.display = "block";
  }
  
  function showLogin() {
    loginSection.style.display = "flex";
    registerSection.style.display = "none";
    homeSection.style.display = "none";
  }
  
  // ==========================
  // LOGIN EMAIL
  // ==========================
  loginBtn.onclick = () => {
    const email = document.getElementById("login-email").value;
    const senha = document.getElementById("login-senha").value;
    
    if (!email || !senha) return showLoginMessage("Preencha todos os campos");
    
    firebase.auth().signInWithEmailAndPassword(email, senha)
      .then(userCredential => {
        currentUser = userCredential.user;
        showLoginMessage("Login realizado com sucesso!", "sucesso");
        showHome();
      })
      .catch(err => {
        showLoginMessage("Erro no login: " + err.message);
      });
  };
  
  // ==========================
  // LOGIN GOOGLE
  // ==========================
  googleBtn.onclick = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().signInWithPopup(provider)
      .then(result => {
        currentUser = result.user;
        showLoginMessage("Login Google realizado!", "sucesso");
        showHome();
      })
      .catch(err => showLoginMessage("Erro Google: " + err.message));
  };
  
  // ==========================
  // MOSTRAR REGISTRO
  // ==========================
  showRegisterBtn.onclick = () => {
    loginSection.style.display = "none";
    registerSection.style.display = "flex";
  };
  
  backLoginBtn.onclick = () => showLogin();
  
  // ==========================
  // REGISTRO EMAIL
  // ==========================
  regBtn.onclick = () => {
    const email = document.getElementById("reg-email").value;
    const senha = document.getElementById("reg-senha").value;
    
    if (!email || !senha) return showRegisterMessage("Preencha todos os campos");
    
    firebase.auth().createUserWithEmailAndPassword(email, senha)
      .then(result => {
        currentUser = result.user;
        showRegisterMessage("Conta criada com sucesso!", "sucesso");
        showHome();
      })
      .catch(err => showRegisterMessage("Erro no registro: " + err.message));
  };
  
  // ==========================
  // MANTER LOGIN FIXO
  // ==========================
  firebase.auth().onAuthStateChanged(user => {
    currentUser = user;
    if (user) showHome();
    else showLogin();
  });
  
});
