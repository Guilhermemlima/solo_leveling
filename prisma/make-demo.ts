import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
const p = new PrismaClient()

const EMAIL = 'demo@ascendsystem.com.br'
const PASSWORD = 'Ascend2026'
const NAME = 'Conta Demo'

async function main() {
  // idempotente: remove demo anterior
  await p.user.deleteMany({ where: { email: EMAIL } })

  const passwordHash = await bcrypt.hash(PASSWORD, 12)
  const missions = await p.mission.findMany({ where: { minDayUnlock: 0 }, select: { id: true } })
  const cls = await p.class.findFirst({ select: { id: true } })

  const user = await p.user.create({
    data: {
      name: NAME, email: EMAIL, passwordHash,
      level: 6, currentXp: 120, totalXp: 1500,
      essences: 1200, fragments: 60,
      currentStreak: 4, bestStreak: 9,
      onboardingCompleted: true,
      selectedClassId: cls?.id ?? null,
      arenaPoints: 180, arenaWins: 7, arenaLosses: 3,
      attributes: { create: { strength: 18, intelligence: 22, discipline: 25, focus: 20, vitality: 16, charisma: 12, wisdom: 14, creativity: 10 } },
      userMissions: { create: missions.map(m => ({ missionId: m.id })) },
    },
    select: { id: true },
  })

  // equipa 2 itens (1 arma + 1 armadura, raridade média) pra mostrar stats de combate
  const weapon = await p.equipment.findFirst({ where: { type: 'WEAPON', rarity: 'RARE' }, select: { id: true } })
  const armor  = await p.equipment.findFirst({ where: { type: 'ARMOR',  rarity: 'RARE' }, select: { id: true } })
  for (const it of [weapon, armor]) {
    if (it) await p.inventory.create({ data: { userId: user.id, equipmentId: it.id, isEquipped: true } })
  }

  // dá 2 caixas pra abrir na demo
  const chestD = await p.chest.findUnique({ where: { key: 'CHEST_D' }, select: { id: true } })
  if (chestD) await p.userChest.create({ data: { userId: user.id, chestId: chestD.id, quantity: 2, source: 'DEMO' } })

  console.log('\n✅ Conta demo criada!')
  console.log('   E-mail:', EMAIL)
  console.log('   Senha :', PASSWORD)
  console.log('   (nível 6, 1200 moedas, itens equipados, 2 caixas, missões ativas)')
}
main().catch(e=>{console.error(e);process.exit(1)}).finally(()=>p.$disconnect())
