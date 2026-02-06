// netlify/functions/download.js

// Para Node 18+ (Netlify usa Node 22), podemos usar fetch global
// Se quiser usar node-fetch, é só instalar e importar

export async function handler(event, context) {
  const file = event.queryStringParameters?.file;
  if (!file) {
    return {
      statusCode: 400,
      body: "Parâmetro 'file' é necessário"
    };
  }

  const GITHUB_TOKEN = process.env.GITHUB_TOKEN; // variavel do Netlify
  const OWNER = "lyedsonmucale0-commits";
  const REPO = "NosPlayAPK";
  const TAG = "V1.2";

  if (GITHUB_TOKEN) {
    // Repositório privado
    const url = `https://api.github.com/repos/${OWNER}/${REPO}/releases/tags/${TAG}`;
    try {
      const res = await fetch(url, {
        headers: { 
          Authorization: `token ${GITHUB_TOKEN}`,
          Accept: "application/vnd.github.v3+json"
        }
      });
      if (!res.ok) throw new Error("Erro ao acessar GitHub API");
      const data = await res.json();
      const asset = data.assets.find(a => a.name === file);
      if (!asset) throw new Error("Arquivo não encontrado no release");

      return {
        statusCode: 302,
        headers: { Location: asset.browser_download_url }
      };
    } catch (err) {
      return {
        statusCode: 500,
        body: `Erro: ${err.message}`
      };
    }
  } else {
    // Repositório público
    const publicUrl = `https://github.com/${OWNER}/${REPO}/releases/download/${TAG}/${file}`;
    return {
      statusCode: 302,
      headers: { Location: publicUrl }
    };
  }
}
