// ==============================
// NOSPLAY — Firebase Config (Sem login anônimo)
// ==============================

// Firebase já incluído no HTML
// <script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js"></script>
// <script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-auth-compat.js"></script>
// <script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-database-compat.js"></script>

// ------------------------------
// CONFIGURAÇÃO DO PROJETO
// ------------------------------
const firebaseConfig = {
  apiKey: "AIzaSyCm2A5Pd6FJU1yrntA_lNDUDsVEymjEJ9M",
  authDomain: "nosplay-705d6.firebaseapp.com",
  databaseURL: "https://nosplay-705d6-default-rtdb.firebaseio.com",
  projectId: "nosplay-705d6",
  storageBucket: "nosplay-705d6.appspot.com",
  messagingSenderId: "572849303567",
  appId: "1:572849303567:web:70bef4f36edcb55dd1b37a"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// ------------------------------
// VARIÁVEL GLOBAL PARA USUÁRIO
// ------------------------------
let currentUser = null;

// ------------------------------
// DETECTAR ESTADO DE LOGIN
// ------------------------------
firebase.auth().onAuthStateChanged(user => {
  currentUser = user;
  if (user) {
    console.log("Usuário logado:", user.email || user.displayName || user.uid);
  } else {
    console.log("Nenhum usuário logado");
  }
});

// ------------------------------
// LOGIN COM EMAIL
// ------------------------------
function loginEmail(email, senha) {
  firebase.auth().signInWithEmailAndPassword(email, senha)
    .then(res => {
      currentUser = res.user;
      console.log("Login com email realizado:", currentUser.email);
    })
    .catch(err => {
      console.error("Erro no login:", err.message);
      alert("Erro no login: " + err.message);
    });
}

// ------------------------------
// REGISTRO COM EMAIL
// ------------------------------
function registerEmail(email, senha) {
  firebase.auth().createUserWithEmailAndPassword(email, senha)
    .then(res => {
      currentUser = res.user;
      console.log("Conta criada com sucesso:", currentUser.email);
      alert(`Conta criada: ${currentUser.email}`);
    })
    .catch(err => {
      console.error("Erro no registro:", err.message);
      alert("Erro no registro: " + err.message);
    });
}

// ------------------------------
// LOGIN COM GOOGLE
// ------------------------------
function loginGoogle() {
  const provider = new firebase.auth.GoogleAuthProvider();
  firebase.auth().signInWithPopup(provider)
    .then(res => {
      currentUser = res.user;
      console.log("Login Google realizado:", currentUser.email);
    })
    .catch(err => {
      console.error("Erro no login Google:", err.message);
      alert("Erro no login Google: " + err.message);
    });
}

// ------------------------------
// LOGOUT
// ------------------------------
function logout() {
  firebase.auth().signOut()
    .then(() => {
      currentUser = null;
      console.log("Usuário deslogado");
    })
    .catch(err => console.error("Erro ao deslogar:", err.message));
}

// ------------------------------
// DOWNLOADS
// ------------------------------
function incrementDownloads(appName) {
  if (!currentUser) { alert("Faça login antes de baixar!"); return; }
  const ref = db.ref(`apps/${appName}/downloads`);
  ref.transaction(current => (current || 0) + 1);
}

// ------------------------------
// RATINGS
// ------------------------------
function saveRating(appName, stars) {
  if (!currentUser) { alert("Faça login para avaliar!"); return; }
  const uid = currentUser.uid;
  db.ref(`ratings/${appName}/${uid}`).set({ value: stars });
  updateAverageRating(appName);
}

function updateAverageRating(appName) {
  db.ref(`ratings/${appName}`).once("value", snap => {
    let total = 0, count = 0;
    snap.forEach(s => { total += s.val().value; count++; });
    db.ref(`apps/${appName}/rating`).set({ stars: total, votes: count });
  });
}

// ------------------------------
// COMENTÁRIOS
// ------------------------------
function addComment(appName, text) {
  if (!currentUser) { alert("Faça login para comentar!"); return; }
  const comment = {
    userId: currentUser.uid,
    name: currentUser.displayName || currentUser.email || "Anônimo",
    text,
    createdAt: Date.now()
  };
  db.ref(`comments/${appName}`).push(comment);
}

function likeComment(appName, commentId) {
  if (!currentUser) { alert("Faça login para curtir!"); return; }
  const ref = db.ref(`comments/${appName}/${commentId}/likes/${currentUser.uid}`);
  ref.once("value", snap => snap.exists() ? ref.remove() : ref.set(true));
}

// ------------------------------
// FUNÇÕES DE UTILIDADE
// ------------------------------
function getDownloads(appName, callback) {
  db.ref(`apps/${appName}/downloads`).once("value", snap => callback(snap.val() || 0));
}

function getRating(appName, callback) {
  db.ref(`apps/${appName}/rating`).once("value", snap => callback(snap.val() || { stars: 0, votes: 0 }));
}

function getComments(appName, callback) {
  db.ref(`comments/${appName}`).once("value", snap => callback(snap.val() || {}));
}
