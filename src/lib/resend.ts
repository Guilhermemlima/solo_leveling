/**
 * Serviço de e-mail transacional via Resend (REST API, sem SDK extra).
 *
 * Segurança:
 * - RESEND_API_KEY nunca é exposta ao cliente — usada apenas em Server Actions / Route Handlers.
 * - A senha temporária em texto puro NUNCA é logada, salva em DB ou retornada em respostas.
 *   Ela existe somente na memória durante o processamento e viaja exclusivamente pelo e-mail.
 *
 * Variáveis de ambiente necessárias:
 *   RESEND_API_KEY       — chave da API Resend (re_...)
 *   RESEND_FROM_EMAIL    — opcional; padrão: "Ascend System <noreply@ascendsystem.com.br>"
 *   NEXT_PUBLIC_APP_URL  — URL base da plataforma
 */

import crypto from 'crypto'

// ─── Mapeamento de planos ────────────────────────────────────────────────────

const PLAN_NAMES: Record<string, string> = {
  mensal:    'Plano Mensal',
  anual:     'Plano Anual',
  vitalicio: 'Plano Fundador (Vitalício)',
  fundador:  'Plano Fundador (Vitalício)',
}

export function planLabel(plan: string | null | undefined): string {
  if (!plan) return 'Ascend System'
  return PLAN_NAMES[plan.toLowerCase()] ?? plan
}

// ─── Geração de senha temporária segura ─────────────────────────────────────

/**
 * Gera senha temporária criptograficamente segura (CSPRNG via crypto.randomBytes).
 *
 * - 16 caracteres por padrão
 * - Ao menos 1 maiúscula, 1 minúscula, 1 dígito, 1 símbolo
 * - Remove caracteres ambíguos (0, O, I, l, 1) para facilitar digitação
 * - Usa rejeição de módulo para eliminar viés estatístico
 * - NUNCA loga ou persiste a senha gerada
 */
export function generateTemporaryPassword(length = 16): string {
  const upper   = 'ABCDEFGHJKLMNPQRSTUVWXYZ'  // sem I, O
  const lower   = 'abcdefghjkmnpqrstuvwxyz'   // sem i, l, o
  const digits  = '23456789'                   // sem 0, 1
  const symbols = '@#$%&*!?'
  const all     = upper + lower + digits + symbols

  const mandatory = [
    pickSecure(upper),
    pickSecure(lower),
    pickSecure(digits),
    pickSecure(symbols),
  ]

  const rest: string[] = []
  for (let i = mandatory.length; i < length; i++) {
    rest.push(pickSecure(all))
  }

  const combined = [...mandatory, ...rest]

  // Fisher-Yates shuffle com bytes aleatórios seguros
  for (let i = combined.length - 1; i > 0; i--) {
    const j = crypto.randomBytes(1)[0] % (i + 1)
    ;[combined[i], combined[j]] = [combined[j], combined[i]]
  }

  return combined.join('')
}

/** Seleciona caractere aleatório sem viés de módulo */
function pickSecure(charset: string): string {
  const max = 256 - (256 % charset.length)
  let byte: number
  do {
    byte = crypto.randomBytes(1)[0]
  } while (byte >= max)
  return charset[byte % charset.length]
}

// ─── Interfaces ──────────────────────────────────────────────────────────────

export interface AccessEmailParams {
  name:              string
  email:             string
  temporaryPassword: string   // NUNCA logue este campo
  appUrl:            string
  planName:          string
  supportEmail?:     string
}

export interface SendResult {
  ok:     boolean
  id?:    string
  error?: string
}

// ─── Template HTML Responsivo ────────────────────────────────────────────────

function buildHtml(p: AccessEmailParams): string {
  const firstName = (p.name?.split(' ')[0] || 'Guerreiro').trim()
  const loginUrl  = `${p.appUrl}/login`
  const support   = p.supportEmail ?? 'guilhermemulinarelima@gmail.com'
  const year      = new Date().getFullYear()

  return `<!DOCTYPE html>
<html lang="pt-BR" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <meta http-equiv="X-UA-Compatible" content="IE=edge"/>
  <title>Seu acesso ao Ascend System foi liberado</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&display=swap');
    * { box-sizing: border-box; }
    body { margin: 0; padding: 0; background-color: #0d0d14;
           font-family: 'Inter','Segoe UI',Arial,sans-serif;
           -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    .wrap { width: 100%; background: #0d0d14; padding: 40px 16px; }
    .card { max-width: 600px; margin: 0 auto; background: #13131f;
            border-radius: 20px; overflow: hidden;
            border: 1px solid rgba(124,58,237,.25);
            box-shadow: 0 25px 60px rgba(0,0,0,.6); }
    .hdr { background: linear-gradient(135deg,#1e1b4b 0%,#1a103c 40%,#0f0a2e 100%);
           padding: 40px 40px 30px; text-align: center;
           border-bottom: 1px solid rgba(124,58,237,.2); }
    .logo-badge { display: inline-block; background: rgba(124,58,237,.15);
                  border: 1px solid rgba(124,58,237,.4); border-radius: 50px;
                  padding: 8px 22px; margin-bottom: 20px;
                  font-size: 13px; font-weight: 700; letter-spacing: 3px;
                  color: #a78bfa; text-transform: uppercase; }
    .hdr h1 { font-size: 28px; font-weight: 900; color: #fff;
              letter-spacing: -.5px; margin: 0 0 8px; line-height: 1.2; }
    .hdr p { font-size: 13px; color: #7c6fac; letter-spacing: 2px;
             text-transform: uppercase; margin: 0; }
    .banner { background: linear-gradient(135deg,rgba(52,211,153,.1),rgba(16,185,129,.07));
              border-top: 3px solid #34d399; padding: 18px 40px;
              display: flex; align-items: center; gap: 14px; }
    .banner .ico { font-size: 26px; flex-shrink: 0; }
    .banner strong { display: block; color: #34d399; font-size: 13px;
                     font-weight: 700; letter-spacing: 1px;
                     text-transform: uppercase; margin-bottom: 2px; }
    .banner span { color: #6ee7b7; font-size: 13px; }
    .body { padding: 36px 40px; }
    .greeting { font-size: 24px; font-weight: 800; color: #fff; margin: 0 0 12px; }
    .greeting em { font-style: normal; color: #a78bfa; }
    .intro { font-size: 15px; color: #94a3b8; line-height: 1.75; margin: 0 0 30px; }
    .intro strong { color: #e2e8f0; }
    .access-card { background: linear-gradient(135deg,#1a1040,#150d36);
                   border: 1px solid rgba(124,58,237,.35); border-radius: 16px;
                   padding: 26px; margin: 0 0 26px; position: relative; overflow: hidden; }
    .access-card::before { content:''; position: absolute; top:0;left:0;right:0;
                            height: 2px;
                            background: linear-gradient(90deg,#7c3aed,#4f46e5,#7c3aed); }
    .card-label { font-size: 11px; font-weight: 700; letter-spacing: 3px;
                  color: #7c3aed; text-transform: uppercase; margin: 0 0 20px; }
    .field { margin-bottom: 16px; }
    .field-lbl { font-size: 11px; color: #475569; font-weight: 600;
                 letter-spacing: 1px; text-transform: uppercase;
                 margin-bottom: 6px; display: block; }
    .field-val { background: rgba(255,255,255,.04); border: 1px solid rgba(255,255,255,.08);
                 border-radius: 8px; padding: 12px 16px; font-size: 14px;
                 color: #e2e8f0; font-weight: 500; word-break: break-all; }
    .field-val.pwd { background: rgba(251,191,36,.06); border-color: rgba(251,191,36,.25);
                     font-family: 'Courier New',monospace; font-size: 22px;
                     font-weight: 700; color: #fbbf24; letter-spacing: 3px;
                     text-align: center; }
    .field-val.url { color: #818cf8; font-size: 13px; text-decoration: none; display: block; }
    .plan-badge { display: inline-block; background: rgba(99,102,241,.15);
                  border: 1px solid rgba(99,102,241,.35); border-radius: 6px;
                  padding: 5px 14px; font-size: 12px; font-weight: 700;
                  color: #818cf8; letter-spacing: .5px; margin-top: 8px; }
    .cta { text-align: center; margin: 26px 0; }
    .btn { display: inline-block;
           background: linear-gradient(135deg,#7c3aed 0%,#4f46e5 100%);
           color: #fff !important; text-decoration: none;
           padding: 16px 48px; border-radius: 12px; font-size: 15px;
           font-weight: 700; letter-spacing: 1px; text-transform: uppercase;
           box-shadow: 0 8px 25px rgba(124,58,237,.4); }
    .sec-box { background: rgba(251,191,36,.06); border: 1px solid rgba(251,191,36,.2);
               border-left: 3px solid #fbbf24; border-radius: 10px;
               padding: 16px 20px; margin: 0 0 26px; }
    .sec-box p { margin: 0; font-size: 13px; color: #fcd34d; line-height: 1.65; }
    .sec-box strong { color: #fbbf24; }
    .support { border-top: 1px solid rgba(255,255,255,.06); padding-top: 22px; margin-top: 4px; }
    .support p { margin: 0 0 8px; font-size: 14px; color: #64748b; line-height: 1.65; }
    .support a { color: #818cf8; text-decoration: none; font-weight: 600; }
    .ftr { background: rgba(0,0,0,.3); border-top: 1px solid rgba(255,255,255,.05);
           padding: 22px 40px; text-align: center; }
    .ftr-logo { font-size: 13px; font-weight: 800; color: #4c4580;
                letter-spacing: 2px; text-transform: uppercase; margin-bottom: 6px; }
    .ftr-tag { font-size: 11px; color: #2d2a4a; letter-spacing: 3px;
               text-transform: uppercase; margin-bottom: 10px; }
    .ftr-copy { font-size: 11px; color: #2d2a4a; margin: 0; }
    @media only screen and (max-width:600px){
      .wrap{padding:20px 8px}
      .hdr{padding:28px 22px 20px}
      .hdr h1{font-size:22px}
      .banner{padding:14px 22px;flex-direction:column;gap:8px;text-align:center}
      .body{padding:26px 22px}
      .greeting{font-size:20px}
      .access-card{padding:20px 16px}
      .field-val.pwd{font-size:17px;letter-spacing:2px}
      .btn{padding:14px 30px;font-size:14px}
      .ftr{padding:18px 22px}
    }
  </style>
</head>
<body>
<div class="wrap">
  <div class="card">
    <div class="hdr">
      <div class="logo-badge">&#9889; Ascend System</div>
      <h1>Seu acesso foi liberado!</h1>
      <p>Foco &bull; Disciplina &bull; Evolu&ccedil;&atilde;o</p>
    </div>
    <div class="banner">
      <span class="ico">&#10003;</span>
      <div>
        <strong>Pagamento Confirmado</strong>
        <span>Sua conta est&aacute; pronta para uso imediato.</span>
      </div>
    </div>
    <div class="body">
      <h2 class="greeting">Ol&aacute;, <em>${firstName}</em>!</h2>
      <p class="intro">
        Seu pagamento foi <strong>confirmado com sucesso</strong> e o seu acesso ao
        <strong>Ascend System</strong> j&aacute; est&aacute; ativo.
        Abaixo est&atilde;o seus dados de acesso. Guarde-os em local seguro.
      </p>
      <div class="access-card">
        <div class="card-label">&#128274; Dados de Acesso</div>
        <div class="field">
          <span class="field-lbl">E-mail de login</span>
          <div class="field-val">${p.email}</div>
        </div>
        <div class="field">
          <span class="field-lbl">Senha tempor&aacute;ria</span>
          <div class="field-val pwd">${p.temporaryPassword}</div>
        </div>
        <div class="field">
          <span class="field-lbl">Endere&ccedil;o da plataforma</span>
          <a href="${loginUrl}" class="field-val url">${loginUrl}</a>
        </div>
        <div class="plan-badge">&#10022; ${p.planName}</div>
      </div>
      <div class="cta">
        <a href="${loginUrl}" class="btn">&#128640;&nbsp; Acessar a Plataforma</a>
      </div>
      <div class="sec-box">
        <p>
          <strong>&#9888;&#65039; Importante:</strong> Esta &eacute; uma senha
          <strong>tempor&aacute;ria</strong>. Por seguran&ccedil;a, altere-a ap&oacute;s
          o primeiro acesso em <strong>Perfil &rarr; Seguran&ccedil;a</strong>.
        </p>
      </div>
      <div class="support">
        <p>Ficou com d&uacute;vidas ou precisa de ajuda?</p>
        <p>Suporte: <a href="mailto:${support}">${support}</a></p>
        <p style="margin-top:14px;color:#475569;font-size:13px;">
          Comece sua jornada, complete suas miss&otilde;es e acompanhe sua evolu&ccedil;&atilde;o! &#127919;
        </p>
      </div>
    </div>
    <div class="ftr">
      <div class="ftr-logo">&#9889; Ascend System</div>
      <div class="ftr-tag">Foco &bull; Disciplina &bull; Evolu&ccedil;&atilde;o</div>
      <p class="ftr-copy">&copy; ${year} Ascend System. Todos os direitos reservados.</p>
    </div>
  </div>
</div>
</body>
</html>`
}

// ─── Template Texto Simples ──────────────────────────────────────────────────

function buildText(p: AccessEmailParams): string {
  const firstName = (p.name?.split(' ')[0] || 'Guerreiro').trim()
  const loginUrl  = `${p.appUrl}/login`
  const support   = p.supportEmail ?? 'guilhermemulinarelima@gmail.com'
  const year      = new Date().getFullYear()

  return [
    `============================================`,
    `       ASCEND SYSTEM — ACESSO LIBERADO      `,
    `============================================`,
    ``,
    `Olá, ${firstName}!`,
    ``,
    `Seu pagamento foi confirmado com sucesso.`,
    `Seu acesso ao Ascend System já está ativo.`,
    ``,
    `--------------------------------------------`,
    ` DADOS DE ACESSO`,
    `--------------------------------------------`,
    ``,
    ` E-mail:           ${p.email}`,
    ` Senha temporária:  ${p.temporaryPassword}`,
    ` Plano:            ${p.planName}`,
    ` URL de acesso:    ${loginUrl}`,
    ``,
    `--------------------------------------------`,
    ``,
    `IMPORTANTE: Esta é uma senha temporária.`,
    `Altere-a após o primeiro acesso em:`,
    `  Perfil → Segurança`,
    ``,
    `--------------------------------------------`,
    ``,
    `Dúvidas? Fale com o suporte:`,
    support,
    ``,
    `Comece sua jornada e acompanhe sua evolução!`,
    ``,
    `============================================`,
    `   © ${year} Ascend System`,
    `   Foco. Disciplina. Evolução.`,
    `============================================`,
  ].join('\n')
}

// ─── Envio do E-mail ─────────────────────────────────────────────────────────

/**
 * Envia e-mail de acesso após pagamento confirmado.
 *
 * - Nunca lança exceção — sempre retorna SendResult.
 * - A senha temporária NÃO é logada em nenhuma circunstância.
 * - Só é chamado após confirmação real do pagamento (evento aprovado pelo webhook).
 */
export async function sendAccessEmail(params: AccessEmailParams): Promise<SendResult> {
  const resendKey = process.env.RESEND_API_KEY

  if (!resendKey || resendKey.trim() === '' || resendKey.includes('CONFIGURE')) {
    console.warn('[Resend] RESEND_API_KEY não configurada — e-mail não enviado.')
    return { ok: false, error: 'RESEND_API_KEY ausente ou inválida' }
  }

  const fromEmail = (process.env.RESEND_FROM_EMAIL?.trim())
    || 'Ascend System <noreply@ascendsystem.com.br>'

  const emailPayload = {
    from:    fromEmail,
    to:      [params.email],
    subject: 'Seu acesso ao Ascend System foi liberado ⚡',
    html:    buildHtml(params),
    text:    buildText(params),
    tags: [
      { name: 'category', value: 'access_email' },
      { name: 'plan',     value: params.planName.toLowerCase().replace(/\s+/g, '_').slice(0, 20) },
    ],
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method:  'POST',
      headers: {
        'Authorization': `Bearer ${resendKey}`,
        'Content-Type':  'application/json',
      },
      body: JSON.stringify(emailPayload),
    })

    if (!res.ok) {
      const errText = await res.text().catch(() => '(sem body)')
      // Loga status e mensagem, mas NUNCA a senha temporária
      console.error(`[Resend] Falha no envio: ${res.status}`, errText)
      return { ok: false, error: `HTTP ${res.status}` }
    }

    const json = await res.json().catch(() => ({})) as { id?: string }
    console.log(`[Resend] E-mail de acesso enviado. ID: ${json?.id ?? 'desconhecido'}`)
    return { ok: true, id: json?.id }

  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[Resend] Erro de rede ao enviar e-mail:', message)
    return { ok: false, error: message }
  }
}
