const crypto = require("crypto");

module.exports = async (req, res) => {

  const { tag, expires, signature, appId } = req.query;

  const OWNER = "lyedsonmucale0-commits";
  const REPO = "NosPlayAPK";

  const TOKEN = process.env.GITHUB_TOKEN;
  const SECRET = process.env.DOWNLOAD_SECRET;

  const VALID_APP_ID = "NosPlay-Android-2026";

  if (!SECRET) {
    return res.status(500).send("Configuração inválida");
  }

  // 🔐 Verificar App ID
  if (!appId || appId !== VALID_APP_ID) {
    return res.status(403).send("App não autorizado");
  }

  // 🔐 Validar parâmetros
  if (!tag || !expires || !signature) {
    return res.status(400).send("Parâmetros inválidos");
  }

  if (!/^V\d+\.\d+$/.test(tag)) {
    return res.status(400).send("Formato inválido");
  }

  if (Date.now() > parseInt(expires)) {
    return res.status(403).send("Link expirado");
  }

  // 🔐 Validar assinatura
  const data = `${tag}:${expires}:${appId}`;

  const expectedSignature = crypto
    .createHmac("sha256", SECRET)
    .update(data)
    .digest("hex");

  if (signature !== expectedSignature) {
    return res.status(403).send("Assinatura inválida");
  }

  try {

    const releaseRes = await fetch(
      `https://api.github.com/repos/${OWNER}/${REPO}/releases/tags/${tag}`,
      {
        headers: TOKEN ? {
          Accept: "application/vnd.github+json",
          Authorization: `token ${TOKEN}`
        } : {
          Accept: "application/vnd.github+json"
        }
      }
    );

    if (!releaseRes.ok) {
      return res.status(404).send("Release não encontrada");
    }

    const releaseData = await releaseRes.json();

    const asset = releaseData.assets.find(a =>
      a.name.toLowerCase().endsWith(".apk")
    );

    if (!asset) {
      return res.status(404).send("APK não encontrado");
    }

    return res.redirect(asset.browser_download_url);

  } catch (error) {
    console.error(error);
    return res.status(500).send("Erro interno");
  }
};
