/* Simula o fluxo de compra ponta a ponta e limpa tudo ao final. */
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

const TEST_EMAIL = `__teste_compra_${Date.now()}@verify.local`

async function main() {
  console.log('\n=== SIMULAÇÃO DE COMPRA ===')
  let ok = true

  // 1) Webhook recebe compra aprovada → cria pending_member
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  const pending = await prisma.pendingMember.create({
    data: { email: TEST_EMAIL, name: 'Comprador Teste', planKey: 'anual', expiresAt },
  })
  console.log(`  1. Webhook → convite criado (token ${pending.token.slice(0, 8)}…, plano ${pending.planKey})`)

  // 2) verify-invite: token válido, não expirado
  const verify = await prisma.pendingMember.findUnique({ where: { token: pending.token } })
  const valid = !!verify && verify.expiresAt > new Date() && verify.email === TEST_EMAIL
  console.log(`  2. verify-invite → ${valid ? '✅ convite válido' : '❌ inválido'}`)
  if (!valid) ok = false

  // 3) Registro: cria usuário e remove o convite (transação, como na rota real)
  let createdUserId = ''
  try {
    const user = await prisma.$transaction(async tx => {
      const u = await tx.user.create({
        data: { name: 'Comprador Teste', email: TEST_EMAIL, passwordHash: 'hash_de_teste', attributes: { create: {} } },
        select: { id: true },
      })
      await tx.pendingMember.delete({ where: { token: pending.token } })
      return u
    })
    createdUserId = user.id
    console.log('  3. Registro → ✅ usuário criado e convite consumido')
  } catch (e) {
    ok = false
    console.log('  3. Registro → ❌ falhou:', (e as Error).message.split('\n')[0])
  }

  // 4) Token não pode ser reutilizado
  const reused = await prisma.pendingMember.findUnique({ where: { token: pending.token } })
  console.log(`  4. Reuso de token → ${reused ? '❌ ainda existe' : '✅ bloqueado (convite removido)'}`)
  if (reused) ok = false

  // 5) Email duplicado é barrado (unique constraint)
  try {
    await prisma.user.create({ data: { name: 'Dup', email: TEST_EMAIL, passwordHash: 'x', attributes: { create: {} } } })
    console.log('  5. Email duplicado → ❌ permitiu duplicar')
    ok = false
  } catch {
    console.log('  5. Email duplicado → ✅ barrado pela constraint unique')
  }

  // Limpeza
  if (createdUserId) await prisma.user.delete({ where: { id: createdUserId } })
  await prisma.pendingMember.deleteMany({ where: { email: TEST_EMAIL } })
  console.log('  🧹 Dados de teste removidos')

  console.log(`\n${ok ? '✅ FLUXO DE COMPRA OK' : '❌ FLUXO COM PROBLEMAS'}\n`)
}

main().catch(e => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())
