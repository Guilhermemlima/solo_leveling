// Forge system: upgrade, repair, enchant

export const MAX_UPGRADE = 15

// Cost in essences to upgrade from level n to n+1
export function upgradeCost(currentLevel: number): number {
  if (currentLevel < 5) return 20 + currentLevel * 10
  if (currentLevel < 10) return 80 + currentLevel * 20
  return 200 + currentLevel * 40
}

// Success chance (0–1) for upgrade
export function upgradeChance(currentLevel: number): number {
  if (currentLevel < 5) return 0.95
  if (currentLevel < 8) return 0.80
  if (currentLevel < 10) return 0.65
  if (currentLevel < 12) return 0.45
  if (currentLevel < 14) return 0.30
  return 0.15
}

// Bonus value multiplier: base + 5% per upgrade level
export function upgradedBonusValue(baseValue: number, upgradeLevel: number): number {
  return baseValue * (1 + upgradeLevel * 0.05)
}

// Repair cost per point of durability missing
export function repairCost(missing: number): number {
  return Math.max(1, Math.ceil(missing * 0.5))
}

// Durability drain per forge action (upgrade attempt)
export const UPGRADE_DURABILITY_DRAIN = 5

// Readability helpers
export function upgradeLabel(level: number): string {
  return level === 0 ? 'Normal' : `+${level}`
}

export function chanceLabel(chance: number): string {
  return `${Math.round(chance * 100)}%`
}
