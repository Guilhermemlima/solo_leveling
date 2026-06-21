import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const noImgEquip = await prisma.equipment.findMany({
    where: { imageUrl: null },
    select: { name: true, type: true, rarity: true, rank: true, price: true },
    orderBy: [{ type: 'asc' }, { price: 'asc' }],
  })

  const noImgEnemy = await prisma.enemy.findMany({
    where: { imageUrl: null },
    select: { name: true, rank: true, type: true, key: true },
    orderBy: { rank: 'asc' },
  })

  // Arena bots are stored as opponentName in Battle or defined in the arena seed
  // They are hardcoded in the arena route, not in DB — check arena route for bot data
  console.log(`\n=== EQUIPAMENTOS SEM IMAGEM (${noImgEquip.length}) ===`)
  noImgEquip.forEach(e =>
    console.log(`  [${e.type}] ${e.name} | ${e.rarity}${e.rank ? ' | Rank ' + e.rank : ''} | ${e.price} moedas`)
  )

  console.log(`\n=== INIMIGOS SEM IMAGEM (${noImgEnemy.length}) ===`)
  noImgEnemy.forEach(e =>
    console.log(`  [Rank ${e.rank}] ${e.name} (${e.type}) — key: ${e.key}`)
  )
}

main().catch(console.error).finally(() => prisma.$disconnect())
