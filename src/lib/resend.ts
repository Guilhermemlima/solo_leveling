/**
 * Serviço de e-mail transacional via Resend (REST API, sem dependência extra).
 * NUNCA exponha RESEND_API_KEY no frontend — usado apenas no servidor.
 */

const PLAN_NAMES: Record<string, string> = {
  mensal: 'Plano Mensal',
  anual: 'Plano Anual',
  vitalicio: 'Plano Fundador',
  fundador: 'Plano Fundador',
}

export function planLabel(plan: string | null | undefined): string {
  if (!plan) return 'Acesso ao Ascend System'
  return PLAN_NAMES[plan] ?? plan
}

/**
 * Gera senha temporária forte: 12 caracteres com maiúscula, minúscula,
 * número e símbolo (evitando caracteres ambíguos para facilitar a digitação).
 */
export function generateTemporaryPassword(length = 14): string {
  const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ'   // sem I, O
  const lower = 'abcdefghijkmnpqrstuvwxyz'   // sem l, o
  const digits = '23456789'                  // sem 0, 1
  const symbols = '!@#$%&*?'
  const all = upper + lower + digits + symbols

  const pick = (set: string) => set[Math.floor(Math.random() * set.length)]
  // Garante ao menos um de cada categoria
  const chars = [pick(upper), pick(lower), pick(digits), pick(symbols)]
  for (let i = chars.length; i < length; i++) chars.push(pick(all))
  // Embaralha (Fisher-Yates)
  for (let i = chars.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[chars[i], chars[j]] = [chars[j], chars[i]]
  }
  return chars.join('')
}

export interface AccessEmailParams {
  name: string
  email: string
  temporaryPassword: string
  appUrl: string
  planName: string
}

export interface SendResult {
  ok: boolean
  id?: string
  error?: string
}

function buildHtml(p: AccessEmailParams): string {
  const firstName = p.name?.split(' ')[0] || 'Guerreiro'
  const loginUrl = `${p.appUrl}/login`
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Seu acesso ao Ascend System foi liberado</title>
</head>
<body style="margin:0;padding:0;background-color:#0a0a0f;font-family:'Segoe UI',Arial,sans-serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#0a0a0f;padding:32px 16px;">
<tr><td align="center">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:linear-gradient(135deg,#1a1a2e 0%,#16213e 50%,#0f3460 100%);border-radius:16px;overflow:hidden;border:1px solid rgba(139,92,246,0.3);">
<tr>
<td style="padding:36px 36px 18px;text-align:center;background:linear-gradient(135deg,rgba(139,92,246,0.2),rgba(59,130,246,0.2));">
<div style="font-size:30px;font-weight:900;letter-spacing:3px;color:#ffffff;text-transform:uppercase;">&#9889; ASCEND SYSTEM</div>
<div style="color:#a78bfa;font-size:12px;letter-spacing:4px;text-transform:uppercase;margin-top:6px;">Foco. Disciplina. Evolução.</div>
</td>
</tr>
<tr>
<td style="padding:28px 36px;">
<h1 style="color:#ffffff;font-size:21px;margin:0 0 14px;">Seu acesso foi liberado &#127881;</h1>
<p style="color:#e2e8f0;font-size:16px;margin:0 0 8px;">Olá, <strong style="color:#a78bfa;">${firstName}</strong>!</p>
<p style="color:#94a3b8;font-size:15px;line-height:1.7;margin:0 0 22px;">
Seu pagamento foi <strong style="color:#34d399;">confirmado</strong> e sua conta já está pronta para acesso.
Plano adquirido: <strong style="color:#ffffff;">${p.planName}</strong>.
</p>
<div style="background:rgba(0,0,0,0.4);border:1px solid rgba(139,92,246,0.4);border-radius:12px;padding:22px;margin:22px 0;">
<div style="color:#a78bfa;font-size:12px;letter-spacing:3px;text-transform:uppercase;margin-bottom:14px;font-weight:700;">&#128274; Dados de acesso</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0">
<tr><td style="padding:6px 0;">
<span style="color:#64748b;font-size:13px;display:block;margin-bottom:4px;">E-mail:</span>
<span style="color:#e2e8f0;font-size:15px;font-weight:600;background:rgba(139,92,246,0.1);padding:8px 12px;border-radius:6px;display:block;">${p.email}</span>
</td></tr>
<tr><td style="padding:6px 0;">
<span style="color:#64748b;font-size:13px;display:block;margin-bottom:4px;">Senha temporária:</span>
<span style="color:#fbbf24;font-size:20px;font-weight:700;background:rgba(251,191,36,0.1);padding:10px 16px;border-radius:6px;display:block;letter-spacing:2px;font-family:monospace;">${p.temporaryPassword}</span>
</td></tr>
<tr><td style="padding:6px 0;">
<span style="color:#64748b;font-size:13px;display:block;margin-bottom:4px;">Site de acesso:</span>
<a href="${loginUrl}" style="color:#60a5fa;font-size:14px;font-weight:600;background:rgba(59,130,246,0.1);padding:8px 12px;border-radius:6px;display:block;text-decoration:none;">${loginUrl}</a>
</td></tr>
</table>
</div>
<div style="background:rgba(251,191,36,0.1);border:1px solid rgba(251,191,36,0.3);border-radius:8px;padding:12px 16px;margin:0 0 22px;">
<p style="color:#fbbf24;font-size:13px;margin:0;line-height:1.6;">&#9888;&#65039; <strong>Importante:</strong> esta é uma senha temporária. Após o primeiro acesso, altere sua senha em <strong>Perfil &rarr; Segurança</strong>.</p>
</div>
<div style="text-align:center;margin:26px 0;">
<a href="${loginUrl}" style="display:inline-block;background:linear-gradient(135deg,#7c3aed,#4f46e5);color:#ffffff;text-decoration:none;padding:15px 38px;border-radius:8px;font-size:15px;font-weight:700;letter-spacing:1px;text-transform:uppercase;">&#128640; Acessar agora</a>
</div>
<p style="color:#94a3b8;font-size:14px;line-height:1.7;margin:18px 0 0;">
Comece sua jornada, complete suas missões e acompanhe sua evolução todos os dias.
</p>
<p style="color:#64748b;font-size:13px;line-height:1.6;margin:18px 0 0;">
Dúvidas? Fale com o suporte: <a href="mailto:guilhermemulinarelima@gmail.com" style="color:#a78bfa;">guilhermemulinarelima@gmail.com</a>
</p>
</td>
</tr>
<tr>
<td style="padding:18px 36px;background:rgba(0,0,0,0.3);text-align:center;">
<p style="color:#475569;font-size:12px;margin:0;">&#169; 2026 Ascend System. Foco. Disciplina. Evolução.</p>
</td>
</tr>
</table>
</td></tr>
</table>
</body>
</html>`
}

function buildText(p: AccessEmailParams): string {
  return [
    `Olá, ${p.name?.split(' ')[0] || 'Guerreiro'}.`,
    '',
    'Seu pagamento foi confirmado e seu acesso ao Ascend System foi liberado.',
    '',
    'Dados de acesso:',
    `E-mail: ${p.email}`,
    `Senha temporária: ${p.temporaryPassword}`,
    `Site de acesso: ${p.appUrl}/login`,
    `Plano adquirido: ${p.planName}`,
    '',
    'Por segurança, recomendamos que você altere sua senha após o primeiro acesso (Perfil > Segurança).',
    '',
    'Comece sua jornada, complete suas missões e acompanhe sua evolução todos os dias.',
    '',
    'Ascend System',
    'Foco. Disciplina. Evolução.',
  ].join('\n')
}

/**
 * Envia o e-mail de acesso. Nunca lança — sempre retorna SendResult,
 * para que uma falha de e-mail não quebre o fluxo do webhook.
 */
export async function sendAccessEmail(params: AccessEmailParams): Promise<SendResult> {
  const resendKey = process.env.RESEND_API_KEY
  if (!resendKey || resendKey.includes('CONFIGURE')) {
    console.warn('[Resend] RESEND_API_KEY não configurada — e-mail não enviado')
    return { ok: false, error: 'RESEND_API_KEY ausente' }
  }
  const from = process.env.RESEND_FROM_EMAIL || 'Ascend System <noreply@ascendsystem.com.br>'

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from,
        to: [params.email],
        subject: 'Bem-vindo ao Ascend System — seus dados de acesso',
        html: buildHtml(params),
        text: buildText(params),
      }),
    })
    if (!res.ok) {
      const err = await res.text()
      console.error('[Resend] Falha no envio:', res.status, err)
      return { ok: false, error: `HTTP ${res.status}` }
    }
    const json = await res.json().catch(() => ({}))
    return { ok: true, id: json?.id }
  } catch (err) {
    console.error('[Resend] Erro de rede ao enviar e-mail:', err)
    return { ok: false, error: (err as Error).message }
  }
}
