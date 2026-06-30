/**
 * Controle de acesso às ferramentas de desenvolvedor.
 * Apenas e-mails na allowlist (env DEV_EMAILS, separados por vírgula)
 * podem usar o painel /dev e a API /api/dev. Sem painel de admin no app,
 * este é o portão. Padrão: o e-mail do dono.
 */
const DEV_EMAILS = (process.env.DEV_EMAILS || 'guilhermemulinarelima@gmail.com')
  .split(',')
  .map(e => e.trim().toLowerCase())
  .filter(Boolean)

export function isDevUser(email: string | null | undefined): boolean {
  if (!email) return false
  return DEV_EMAILS.includes(email.toLowerCase())
}
