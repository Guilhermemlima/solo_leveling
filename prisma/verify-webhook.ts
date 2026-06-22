/* Testa o handler do webhook da Cakto ponta a ponta e limpa os dados de teste. */
import { POST } from '../src/app/api/webhooks/cakto/route'
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

const EMAIL = `__wh_teste_${Date.now()}@verify.local`
const TX = `tx_${Date.now()}`

function makeReq(body: any) {
  return new Request('http://local/api/webhooks/cakto', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
  }) as any
}

async function main() {
  let pass = 0, fail = 0
  const ok = (cond: boolean, label: string) => { cond ? (pass++, console.log('  ✅', label)) : (fail++, console.log('  ❌', label)) }

  console.log('\n=== TESTE DO WEBHOOK CAKTO ===')

  // 1) Pagamento aprovado → cria usuário
  const approved = {
    event: 'purchase.approved',
    data: { id: TX, status: 'approved', customer: { email: EMAIL, name: 'Comprador Teste' }, product: { name: 'Ascend System — Anual' } },
  }
  let res = await POST(makeReq(approved))
  let json = await res.json()
  ok(res.status === 200 && json.created === true, '1. Pagamento aprovado cria usuário')
  const user = await prisma.user.findUnique({ where: { email: EMAIL }, select: { plan: true, paymentStatus: true, accessEmailStatus: true } })
  ok(user?.plan === 'anual' && user?.paymentStatus === 'APPROVED', '2. Plano e status salvos no usuário (anual / APPROVED)')
  ok(user?.accessEmailStatus === 'failed' || user?.accessEmailStatus === 'sent', '3. emailStatus registrado (failed sem RESEND_API_KEY é esperado)')

  // 4) Webhook duplicado (mesma transação) → não recria nem reenvia
  res = await POST(makeReq(approved))
  json = await res.json()
  ok(res.status === 200 && json.duplicate === true, '4. Webhook duplicado é ignorado')

  // 5) Evento recusado → não cria usuário
  const refusedEmail = `__wh_recusado_${Date.now()}@verify.local`
  res = await POST(makeReq({ event: 'purchase.refused', data: { id: `tx_ref_${Date.now()}`, status: 'refused', customer: { email: refusedEmail }, product: { name: 'Anual' } } }))
  json = await res.json()
  const refusedUser = await prisma.user.findUnique({ where: { email: refusedEmail } })
  ok(json.ignored === true && !refusedUser, '5. Pagamento recusado não cria usuário')

  // 6) Pagamento aprovado sem e-mail → erro controlado
  res = await POST(makeReq({ event: 'purchase.approved', data: { id: `tx_noemail_${Date.now()}`, status: 'approved', customer: {}, product: { name: 'Anual' } } }))
  ok(res.status === 400, '6. Pagamento sem e-mail retorna erro controlado (400)')

  // 7) Payload inválido → 400
  const badReq = new Request('http://local/api/webhooks/cakto', { method: 'POST', body: '{invalid' }) as any
  res = await POST(badReq)
  ok(res.status === 400, '7. Payload inválido retorna 400')

  // 8) Usuário existente → atualiza plano (compra de outro plano)
  res = await POST(makeReq({ event: 'sale.approved', data: { id: `tx_upd_${Date.now()}`, status: 'paid', customer: { email: EMAIL, name: 'Comprador Teste' }, product: { name: 'Ascend System — Fundador' } } }))
  json = await res.json()
  const updated = await prisma.user.findUnique({ where: { email: EMAIL }, select: { plan: true } })
  ok(json.updated === true && updated?.plan === 'vitalicio', '8. Usuário existente tem plano atualizado (→ vitalicio)')

  // Limpeza
  await prisma.user.deleteMany({ where: { email: { in: [EMAIL, refusedEmail] } } })
  await prisma.processedWebhook.deleteMany({ where: { email: { in: [EMAIL, refusedEmail] } } })
  await prisma.processedWebhook.deleteMany({ where: { rawPayload: { contains: 'verify.local' } } })
  console.log('  🧹 Dados de teste removidos')

  console.log(`\n${fail === 0 ? '✅ TODOS OS TESTES PASSARAM' : `❌ ${fail} FALHA(S)`} (${pass} ok / ${fail} falhou)\n`)
  if (fail > 0) process.exit(1)
}

main().catch(e => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())
