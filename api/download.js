export default async function handler(req, res) {

  const { tag } = req.query;

  const OWNER = "lyedsonmucale0-commits";
  const REPO = "NosPlayAPK";
  const TOKEN = process.env.GITHUB_TOKEN; // só precisa se for privado

  if (!tag) {
    return res.status(400).send("Tag não especificada");
  }

  try {

    // Buscar release pela tag
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

    // Encontrar qualquer arquivo .apk
    const asset = releaseData.assets.find(a => a.name.endsWith(".apk"));

    if (!asset) {
      return res.status(404).send("APK não encontrado neste release");
    }

    // Baixar o APK
    const fileRes = await fetch(asset.browser_download_url, {
      headers: TOKEN ? { Authorization: `token ${TOKEN}` } : {}
    });

    const buffer = await fileRes.arrayBuffer();

    // Enviar como download
    res.setHeader("Content-Disposition", `attachment; filename=${asset.name}`);
    res.setHeader("Content-Type", "application/vnd.android.package-archive");

    res.status(200).send(Buffer.from(buffer));

  } catch (error) {
    res.status(500).send("Erro interno ao processar download");
  }
                                          }
