// ==============================
// NOSPLAY — Firebase Config
// ==============================

// Firebase já incluído no HTML
// <script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js"></script>
// <script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-database-compat.js"></script>
// <script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-auth-compat.js"></script>

// Configuração do seu projeto Firebase
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

// ==============================
// VARIÁVEL GLOBAL PARA USUÁRIO
// ==============================
if (typeof userId === "undefined") userId = null;

// ==============================
// LOGIN ANÔNIMO
// ==============================
firebase.auth().signInAnonymously()
  .then(() => {
    userId = firebase.auth().currentUser.uid;
    console.log("Usuário anônimo autenticado:", userId);

    // Inicializar funções que dependem do Firebase
    initFirebaseFeatures();
  })
  .catch((error) => {
    console.error("Erro na autenticação anônima:", error);
    // fallback: gerar ID temporário local se auth falhar
    if (!userId) {
      userId = "u_" + Math.random().toString(36).substr(2, 9);
      console.warn("Usando userId temporário:", userId);
    }
    initFirebaseFeatures();
  });

// ==============================
// FUNÇÕES QUE USAM FIREBASE
// ==============================
function initFirebaseFeatures() {
  // Exemplo de inicialização
  loadAverage("MeuApp");
  getComments("MeuApp", (comments) => console.log("Comentários:", comments));
  getDownloads("MeuApp", (d) => console.log("Downloads:", d));
}

// Pegar número de downloads
function getDownloads(appName, callback) {
  const ref = db.ref(`apps/${appName}/downloads`);
  ref.once('value', snapshot => callback(snapshot.val() || 0));
}

// Incrementar download
function incrementDownloads(appName) {
  const ref = db.ref(`apps/${appName}/downloads`);
  ref.transaction(current => (current || 0) + 1);
}

// Pegar avaliação média
function getRating(appName, callback) {
  const ref = db.ref(`apps/${appName}/rating`);
  ref.once('value', snapshot => callback(snapshot.val() || { stars: 0, votes: 0 }));
}

// Adicionar avaliação do usuário
function addRating(appName, stars) {
  const ref = db.ref(`apps/${appName}/rating`);
  ref.transaction(current => {
    current = current || { stars: 0, votes: 0 };
    current.stars += stars;
    current.votes += 1;
    return current;
  });
}

// Salvar avaliação individual do usuário
function saveRating(appName, value) {
  db.ref(`ratings/${appName}/${userId}`).set({ value });
}

// Calcular média de avaliações
function loadAverage(appName) {
  db.ref(`ratings/${appName}`).on("value", snap => {
    let total = 0, count = 0;
    snap.forEach(s => { total += s.val().value; count++; });
    if (count) console.log(`Média de ${appName}:`, (total / count).toFixed(1));
  });
}

// Pegar comentários
function getComments(appName, callback) {
  const ref = db.ref(`comments/${appName}`);
  ref.once('value', snapshot => callback(snapshot.val() || {}));
}

// Adicionar comentário
function addComment(appName, comment) {
  db.ref(`comments/${appName}`).push(comment);
}

// Curtir comentário
function likeCommentFirebase(appName, commentId) {
  const ref = db.ref(`comments/${appName}/${commentId}/likes/${userId}`);
  ref.once("value", snap => snap.exists() ? ref.remove() : ref.set(true));
}
