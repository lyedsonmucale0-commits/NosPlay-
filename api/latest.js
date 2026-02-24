const crypto = require("crypto");
const versionData = require("../version.json");

module.exports = async (req, res) => {

  const SECRET = process.env.DOWNLOAD_SECRET;
  const appId = "NosPlay-Android-2026";

  if (!SECRET) return res.status(500).json({ error: "Configuração inválida" });

  const tag = versionData.version; // V1.2
  const expires = Date.now() + 5 * 60 * 1000; // link válido por 5 minutos

  const data = `${tag}:${expires}:${appId}`;
  const signature = crypto
    .createHmac("sha256", SECRET)
    .update(data)
    .digest("hex");

  // Monta o link seguro
  const downloadUrl = `https://nosplay.vercel.app/api/download?tag=${tag}&expires=${expires}&appId=${appId}&signature=${signature}`;

  return res.status(200).json({
    version: tag,
    message: versionData.message,
    download: downloadUrl
  });
};
