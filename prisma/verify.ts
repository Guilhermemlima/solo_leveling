/* Verificação de integridade — tabelas, contagens e fluxo de compra. */
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  console.log('\n=== TABELAS DOS MÓDULOS ===')
  const checks: [string, () => Promise<number>][] = [
    ['financial_goals',         () => prisma.financialGoal.count()],
    ['financial_contributions', () => prisma.financialContribution.count()],
    ['investment_simulations',  () => prisma.investmentSimulation.count()],
    ['fitness_goals',           () => prisma.fitnessGoal.count()],
    ['body_measurements',       () => prisma.bodyMeasurement.count()],
    ['exercises',               () => prisma.exercise.count()],
    ['workout_logs',            () => prisma.workoutLog.count()],
    ['pending_members',         () => prisma.pendingMember.count()],
  ]
  for (const [name, fn] of checks) {
    try {
      const n = await fn()
      console.log(`  ✅ ${name.padEnd(26)} OK (${n} registros)`)
    } catch (e) {
      console.log(`  ❌ ${name.padEnd(26)} FALHOU: ${(e as Error).message.split('\n')[0]}`)
    }
  }

  console.log('\n=== CONQUISTAS DOS MÓDULOS ===')
  const titleNames = [
    'Aprendiz Financeiro', 'Investidor Consistente', 'Guardião da Reserva', 'Grande Investidor',
    'Discípulo da Força', 'Atleta em Evolução', 'Corpo em Ascensão', 'Quebrador de Recordes',
  ]
  const found = await prisma.achievement.findMany({ where: { name: { in: titleNames } }, select: { name: true } })
  console.log(`  ${found.length}/${titleNames.length} conquistas-chave presentes`)
  const missing = titleNames.filter(n => !found.some(f => f.name === n))
  if (missing.length) console.log('  ⚠️  Faltando:', missing.join(', '))
  else console.log('  ✅ Todas presentes')

  console.log('\n=== FLUXO DE COMPRA (pending_members) ===')
  const pendings = await prisma.pendingMember.findMany({ orderBy: { createdAt: 'desc' }, take: 5 })
  if (pendings.length === 0) {
    console.log('  ℹ️  Nenhum convite pendente (esperado se ninguém comprou ainda).')
  } else {
    for (const p of pendings) {
      const expired = p.expiresAt < new Date()
      console.log(`  • ${p.email} | plano: ${p.planKey} | ${expired ? '⏰ expirado' : '✅ válido'} | token: ${p.token.slice(0, 8)}…`)
    }
  }

  console.log('\n=== USUÁRIOS ===')
  const userCount = await prisma.user.count()
  console.log(`  Total de usuários: ${userCount}`)

  console.log('\n✅ Verificação concluída.\n')
}

main().catch(e => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())
