import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getAuthUser } from '@/lib/auth'
import { isDevUser } from '@/lib/dev-auth'
import { calculateLevelUp } from '@/lib/game-logic'
import { grantPlanRewards } from '@/lib/plan-rewards'

async function requireDev() {
  const auth = await getAuthUser()
  if (!auth) return { error: NextResponse.json({ error: 'Não autenticado' }, { status: 401 }) }
  if (!isDevUser(auth.email)) return { error: NextResponse.json({ error: 'Acesso restrito a desenvolvedores' }, { status: 403 }) }
  return { userId: auth.userId, email: auth.email }
}

// ── Estado atual + logs (para o painel) ──
export async function GET() {
  const dev = await requireDev()
  if (dev.error) return dev.error
  const uid = dev.userId!

  const [user, items, chests, dailyMissions, webhooks, activity] = await Promise.all([
    prisma.user.findUnique({ where: { id: uid }, select: { name: true, email: true, level: true, essences: true, fragments: true, plan: true, arenaPoints: true, currentStreak: true, penaltiesEnabled: true } }),
    prisma.inventory.count({ where: { userId: uid } }),
    prisma.userChest.aggregate({ where: { userId: uid }, _sum: { quantity: true } }),
    prisma.userMission.count({ where: { userId: uid, mission: { type: 'DAILY' } } }),
    prisma.processedWebhook.findMany({ orderBy: { processedAt: 'desc' }, take: 15, select: { provider: true, status: true, action: true, email: true, emailStatus: true, processedAt: true } }),
    prisma.activityHistory.findMany({ where: { userId: uid }, orderBy: { createdAt: 'desc' }, take: 12, select: { type: true, description: true, createdAt: true } }),
  ])

  return NextResponse.json({
    user,
    counts: { items, chests: chests._sum.quantity ?? 0, dailyMissions },
    webhooks,
    activity,
  })
}

// ── Ações ──
export async function POST(req: NextRequest) {
  const dev = await requireDev()
  if (dev.error) return dev.error
  const uid = dev.userId!

  const body = await req.json().catch(() => ({}))
  const action: string = body.action
  const amount = Math.max(0, Math.min(99_999_999, Number(body.amount) || 0))

  try {
    switch (action) {
      case 'addCoins':
        await prisma.user.update({ where: { id: uid }, data: { essences: { increment: amount } } })
        return ok(`+${amount} moedas`)

      case 'addFragments':
        await prisma.user.update({ where: { id: uid }, data: { fragments: { increment: amount } } })
        return ok(`+${amount} fragmentos`)

      case 'addXp': {
        const u = await prisma.user.findUnique({ where: { id: uid }, select: { level: true, currentXp: true } })
        if (!u) return fail('Usuário não encontrado')
        const lvl = calculateLevelUp(u.level, u.currentXp, amount)
        await prisma.user.update({ where: { id: uid }, data: { level: lvl.level, currentXp: lvl.currentXp, totalXp: { increment: amount } } })
        return ok(`+${amount} XP (nível ${lvl.level})`)
      }

      case 'setLevel': {
        const lv = Math.max(1, Math.min(999, Number(body.level) || 1))
        await prisma.user.update({ where: { id: uid }, data: { level: lv, currentXp: 0 } })
        return ok(`Nível definido para ${lv}`)
      }

      case 'maxAttributes':
        await prisma.attribute.upsert({
          where: { userId: uid },
          update: { strength: 250, intelligence: 250, discipline: 250, focus: 250, vitality: 250, charisma: 250, wisdom: 250, creativity: 250 },
          create: { userId: uid, strength: 250, intelligence: 250, discipline: 250, focus: 250, vitality: 250, charisma: 250, wisdom: 250, creativity: 250 },
        })
        return ok('Atributos no máximo (250)')

      case 'grantAllItems': {
        const all = await prisma.equipment.findMany({ select: { id: true } })
        const owned = new Set((await prisma.inventory.findMany({ where: { userId: uid }, select: { equipmentId: true } })).map(i => i.equipmentId))
        const add = all.filter(e => !owned.has(e.id))
        if (add.length) await prisma.inventory.createMany({ data: add.map(e => ({ userId: uid, equipmentId: e.id })) })
        return ok(`${add.length} itens adicionados`)
      }

      case 'grantAllChests': {
        const chests = await prisma.chest.findMany({ select: { id: true } })
        for (const c of chests) {
          await prisma.userChest.upsert({
            where: { userId_chestId: { userId: uid, chestId: c.id } },
            update: { quantity: { increment: 10 } },
            create: { userId: uid, chestId: c.id, quantity: 10, source: 'DEV' },
          })
        }
        return ok('+10 de cada caixa')
      }

      case 'resetDailyMissions': {
        const now = new Date()
        await prisma.userMission.updateMany({
          where: { userId: uid, mission: { type: 'DAILY' } },
          data: { progress: 0, status: 'ACTIVE', completedAt: null, claimedAt: null, assignedAt: now },
        })
        return ok('Missões diárias reiniciadas')
      }

      case 'maxArena':
        await prisma.user.update({ where: { id: uid }, data: { arenaPoints: 6000, arenaCharges: 5, arenaNextChargeAt: null } })
        return ok('Arena: Rank S + 5 cargas')

      case 'togglePenalties': {
        const u = await prisma.user.findUnique({ where: { id: uid }, select: { penaltiesEnabled: true } })
        const next = !u?.penaltiesEnabled
        await prisma.user.update({ where: { id: uid }, data: { penaltiesEnabled: next } })
        return ok(`Penalidades ${next ? 'ligadas' : 'desligadas'}`)
      }

      case 'simulatePurchase': {
        const plan = String(body.plan || 'vitalicio')
        await prisma.user.update({ where: { id: uid }, data: { plan, paymentStatus: 'APPROVED', purchaseDate: new Date() } })
        const r = await grantPlanRewards(uid, plan).catch(() => null)
        return ok(`Compra simulada (${plan}) + recompensas`, r)
      }

      case 'resetProgress': {
        await resetProgress(uid)
        return ok('Progresso resetado para novo usuário')
      }

      default:
        return fail('Ação desconhecida')
    }
  } catch (e) {
    console.error('[dev] erro:', e)
    return fail('Erro ao executar a ação')
  }
}

function ok(message: string, extra?: unknown) {
  return NextResponse.json({ ok: true, message, extra })
}
function fail(error: string) {
  return NextResponse.json({ ok: false, error }, { status: 400 })
}

/** Reseta o usuário ao estado de "novo" — para testar o fluxo inicial. */
async function resetProgress(uid: string) {
  await prisma.$transaction(async tx => {
    await tx.inventory.deleteMany({ where: { userId: uid } })
    await tx.userChest.deleteMany({ where: { userId: uid } })
    await tx.userAchievement.deleteMany({ where: { userId: uid } })
    await tx.financialContribution.deleteMany({ where: { userId: uid } })
    await tx.financialGoal.deleteMany({ where: { userId: uid } })
    await tx.workoutLog.deleteMany({ where: { userId: uid } })
    await tx.exercise.deleteMany({ where: { userId: uid } })
    await tx.bodyMeasurement.deleteMany({ where: { userId: uid } })
    await tx.fitnessGoal.deleteMany({ where: { userId: uid } })
    await tx.activityHistory.deleteMany({ where: { userId: uid } })
    await tx.userMission.deleteMany({ where: { userId: uid } })
    await tx.attribute.upsert({ where: { userId: uid }, update: { strength: 0, intelligence: 0, discipline: 0, focus: 0, vitality: 0, charisma: 0, wisdom: 0, creativity: 0 }, create: { userId: uid } })
    await tx.user.update({
      where: { id: uid },
      data: {
        level: 1, currentXp: 0, totalXp: 0, essences: 0, fragments: 0,
        currentStreak: 0, bestStreak: 0, arenaPoints: 0, seasonPoints: 0,
        arenaWins: 0, arenaLosses: 0, arenaCharges: 5, lastActiveDate: null,
        selectedClassId: null,
      },
    })
    const missions = await tx.mission.findMany({ where: { minDayUnlock: 0 }, select: { id: true } })
    if (missions.length) await tx.userMission.createMany({ data: missions.map(m => ({ userId: uid, missionId: m.id })) })
  })
}
