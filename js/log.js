// ==============================
// NOSPLAY — Login Email/Google
// ==============================

document.addEventListener("DOMContentLoaded", () => {
  
  let currentUser = null;
  
  const loginSection = document.getElementById("login");
  const registerSection = document.getElementById("register");
  const homeSection = document.getElementById("home");
  
  // ------------------------------
  // MOSTRAR LOGIN
  // ------------------------------
  function showLogin() {
    loginSection.style.display = "flex";
    registerSection.style.display = "none";
    homeSection.style.display = "none";
  }
  
  // ------------------------------
  // OBSERVAR LOGIN FIREBASE
  // ------------------------------
  firebase.auth().onAuthStateChanged(user => {
    currentUser = user;
    
    if (user) {
      console.log("Usuário logado:", user.email || user.displayName);
      loginSection.style.display = "none";
      registerSection.style.display = "none";
      homeSection.style.display = "block";
    } else {
      showLogin();
    }
  });
  
  // ------------------------------
  // LOGIN EMAIL
  // ------------------------------
  document.getElementById("login-btn").onclick = () => {
    const email = document.getElementById("login-email").value.trim();
    const senha = document.getElementById("login-senha").value.trim();
    
    if (!email || !senha) {
      alert("Preencha email e senha!");
      return;
    }
    
    firebase.auth().signInWithEmailAndPassword(email, senha)
      .then(() => {
        console.log("Login realizado com sucesso");
      })
      .catch(err => alert("Erro no login: " + err.message));
  };
  
  // ------------------------------
  // LOGIN GOOGLE
  // ------------------------------
  document.getElementById("login-google-btn").onclick = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    
    firebase.auth().signInWithPopup(provider)
      .then(() => {
        console.log("Login Google realizado");
      })
      .catch(err => alert("Erro login Google: " + err.message));
  };
  
  // ------------------------------
  // REGISTRO EMAIL
  // ------------------------------
  document.getElementById("reg-btn").onclick = () => {
    const email = document.getElementById("reg-email").value.trim();
    const senha = document.getElementById("reg-senha").value.trim();
    
    if (!email || !senha) {
      alert("Preencha email e senha!");
      return;
    }
    
    firebase.auth().createUserWithEmailAndPassword(email, senha)
      .then(() => {
        alert("Conta criada com sucesso! Faça login.");
        showLogin();
      })
      .catch(err => alert("Erro no registro: " + err.message));
  };
  
  // ------------------------------
  // NAVEGAÇÃO ENTRE TELAS
  // ------------------------------
  document.getElementById("show-register").onclick = () => {
    loginSection.style.display = "none";
    registerSection.style.display = "flex";
  };
  
  document.getElementById("back-to-login").onclick = () => {
    showLogin();
  };
  
});
