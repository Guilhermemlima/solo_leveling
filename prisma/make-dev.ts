import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
const p = new PrismaClient()

const EMAIL = 'guilhermemulinarelima@gmail.com'
const PASSWORD = '12345678'

async function main() {
  const user = await p.user.findUnique({ where: { email: EMAIL }, select: { id: true } })
  if (!user) { console.log('❌ conta não encontrada'); return }
  const uid = user.id

  // 1) Senha + status god-mode
  const passwordHash = await bcrypt.hash(PASSWORD, 12)
  await p.user.update({ where: { id: uid }, data: {
    name: 'Guilherme (DEV)',
    passwordHash,
    level: 50, currentXp: 0, totalXp: 500000,
    essences: 9_999_999, fragments: 999_999,
    currentStreak: 30, bestStreak: 100,
    onboardingCompleted: true,
    plan: 'vitalicio', paymentStatus: 'APPROVED', purchaseDate: new Date(),
    arenaPoints: 6000, seasonPoints: 1200, arenaWins: 200, arenaLosses: 10,
    arenaCharges: 5, arenaNextChargeAt: null,
    penaltiesEnabled: false,
  }})

  // 2) Atributos no máximo
  await p.attribute.upsert({
    where: { userId: uid },
    update: { strength: 250, intelligence: 250, discipline: 250, focus: 250, vitality: 250, charisma: 250, wisdom: 250, creativity: 250 },
    create: { userId: uid, strength: 250, intelligence: 250, discipline: 250, focus: 250, vitality: 250, charisma: 250, wisdom: 250, creativity: 250 },
  })

  // 3) Todos os equipamentos (exceto itens-conjunto, que são pacotes da loja)
  const allEq = await p.equipment.findMany({ where: { isFullSet: false }, select: { id: true } })
  const owned = new Set((await p.inventory.findMany({ where: { userId: uid }, select: { equipmentId: true } })).map(i => i.equipmentId))
  const toAdd = allEq.filter(e => !owned.has(e.id))
  if (toAdd.length) await p.inventory.createMany({ data: toAdd.map(e => ({ userId: uid, equipmentId: e.id })) })

  // 4) Todas as caixas (99 de cada)
  const chests = await p.chest.findMany({ select: { id: true } })
  for (const c of chests) {
    await p.userChest.upsert({
      where: { userId_chestId: { userId: uid, chestId: c.id } },
      update: { quantity: 99 },
      create: { userId: uid, chestId: c.id, quantity: 99, source: 'DEV' },
    })
  }

  // 5) Todas as conquistas/títulos desbloqueados
  const achs = await p.achievement.findMany({ select: { id: true } })
  await p.userAchievement.createMany({ data: achs.map(a => ({ userId: uid, achievementId: a.id })), skipDuplicates: true })

  console.log('\n✅ Conta DEV configurada!')
  console.log(`   Login: ${EMAIL} / ${PASSWORD}`)
  console.log(`   Nível 50 · 9.999.999 moedas · 999.999 fragmentos · Rank S`)
  console.log(`   Itens adicionados: ${toAdd.length} (todos) · Caixas: 99 de cada · Conquistas: ${achs.length}`)
  console.log(`   Plano: Fundador · Atributos: 250 · Penalidades: off`)
}
main().catch(e=>{console.error(e);process.exit(1)}).finally(()=>p.$disconnect())
