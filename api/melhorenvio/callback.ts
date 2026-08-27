import type { VercelRequest, VercelResponse } from '@vercel/node';

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string));
}

function page(title: string, body: string) {
  return `<!doctype html><html><head><meta charset="utf-8"><title>${title}</title>
<style>body{font-family:system-ui,sans-serif;max-width:640px;margin:40px auto;padding:0 16px;color:#222}
code,textarea{font-family:ui-monospace,monospace}
textarea{width:100%;padding:8px;font-size:13px;word-break:break-all}
.field{margin-bottom:16px}
label{display:block;font-weight:600;margin-bottom:4px}</style>
</head><body>${body}</body></html>`;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { code, error } = req.query as { code?: string; error?: string };

  if (error) {
    res.status(400).send(page('Erro na autorização', `<h1>Autorização negada</h1><p>${escapeHtml(error)}</p>`));
    return;
  }

  if (!code) {
    res.status(400).send(page('Erro', '<h1>Código ausente</h1><p>Nenhum parâmetro "code" foi recebido.</p>'));
    return;
  }

  const clientId = process.env.MELHOR_ENVIO_CLIENT_ID;
  const clientSecret = process.env.MELHOR_ENVIO_CLIENT_SECRET;
  const redirectUri = process.env.MELHOR_ENVIO_REDIRECT_URI;
  const sandbox = process.env.MELHOR_ENVIO_SANDBOX === 'true';
  const baseUrl = sandbox ? 'https://sandbox.melhorenvio.com.br' : 'https://www.melhorenvio.com.br';

  if (!clientId || !clientSecret || !redirectUri) {
    res.status(500).send(page('Erro', '<h1>Configuração ausente</h1><p>Defina MELHOR_ENVIO_CLIENT_ID, MELHOR_ENVIO_CLIENT_SECRET e MELHOR_ENVIO_REDIRECT_URI nas variáveis de ambiente.</p>'));
    return;
  }

  try {
    const tokenResponse = await fetch(`${baseUrl}/oauth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        grant_type: 'authorization_code',
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        code,
      }),
    });

    const data = await tokenResponse.json();

    if (!tokenResponse.ok) {
      console.error('Erro ao trocar código por token Melhor Envio:', tokenResponse.status, data);
      res.status(502).send(page('Erro', `<h1>Erro ao trocar código por token</h1><pre>${escapeHtml(JSON.stringify(data, null, 2))}</pre>`));
      return;
    }

    res.status(200).send(
      page(
        'Token gerado',
        `<h1>Token gerado com sucesso${sandbox ? ' (sandbox)' : ''}</h1>
        <p>Copie o valor abaixo e cole em <code>MELHOR_ENVIO_TOKEN</code> nas variáveis de ambiente do Vercel. Esta página não guarda o token — feche-a depois de copiar.</p>
        <div class="field"><label>access_token</label><textarea readonly rows="4">${escapeHtml(data.access_token)}</textarea></div>
        <div class="field"><label>refresh_token (guarde também, para renovar depois)</label><textarea readonly rows="4">${escapeHtml(data.refresh_token || '')}</textarea></div>
        <div class="field"><label>expira em</label><p>${escapeHtml(String(data.expires_in))} segundos</p></div>`
      )
    );
  } catch (err) {
    console.error('Erro ao processar callback Melhor Envio:', err);
    res.status(500).send(page('Erro', '<h1>Erro interno</h1>'));
  }
}
