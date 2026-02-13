module.exports = async (req, res) => {

  const { tag } = req.query;

  const OWNER = "lyedsonmucale0-commits";
  const REPO = "NosPlayAPK";
  const TOKEN = process.env.GITHUB_TOKEN;

  // 🔒 Validar tag
  if (!tag) {
    return res.status(400).send("Tag não especificada");
  }

  if (!/^V\d+\.\d+$/.test(tag)) {
    return res.status(400).send("Formato de tag inválido");
  }

  // 🔒 Bloquear acesso externo (opcional mas recomendado)
  const userAgent = req.headers["user-agent"];
  if (!userAgent || !userAgent.includes("NosPlayApp")) {
    return res.status(403).send("Acesso negado");
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
      return res.status(404).send("Release não encontrado");
    }

    const releaseData = await releaseRes.json();

    if (!releaseData.assets || releaseData.assets.length === 0) {
      return res.status(404).send("Nenhum arquivo na release");
    }

    const asset = releaseData.assets.find(a =>
      a.name.toLowerCase().endsWith(".apk")
    );

    if (!asset) {
      return res.status(404).send("APK não encontrado");
    }

    // 🚀 Redirecionar (não baixar no servidor)
    return res.redirect(asset.browser_download_url);

  } catch (error) {
    console.error(error);
    return res.status(500).send("Erro interno");
  }
};
