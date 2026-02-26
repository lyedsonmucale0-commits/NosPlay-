// ==============================
// NOSPLAY — Sistema Global de Alertas
// Arquivo: alert.js
// ==============================

(function () {

  function createAlert(message) {

    // Remove alerta antigo se existir
    const old = document.querySelector(".custom-alert-overlay");
    if (old) old.remove();

    // Overlay
    const overlay = document.createElement("div");
    overlay.className = "custom-alert-overlay";

    // Caixa
    const box = document.createElement("div");
    box.className = "custom-alert-box";

    box.innerHTML = `
      <div class="custom-alert-content">
        <p>${message}</p>
        <button class="custom-alert-btn">OK</button>
      </div>
    `;

    overlay.appendChild(box);
    document.body.appendChild(overlay);

    // Bloqueia scroll
    document.body.style.overflow = "hidden";

    function closeAlert() {
      overlay.remove();
      document.body.style.overflow = "";
    }

    // Botão OK
    box.querySelector(".custom-alert-btn").onclick = closeAlert;

    // Clique fora fecha
    overlay.onclick = function (e) {
      if (e.target === overlay) closeAlert();
    };

    // ESC fecha
    document.addEventListener("keydown", function escClose(e) {
      if (e.key === "Escape") {
        closeAlert();
        document.removeEventListener("keydown", escClose);
      }
    });
  }

  // Substitui alert global
  window.alert = function (msg) {
    createAlert(msg);
  };

})();
