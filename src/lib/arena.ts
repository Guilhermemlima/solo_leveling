export const MAX_CHARGES = 5
export const CHARGE_MS   = 30 * 60 * 1000 // 30 min

export function computeCharges(stored: number, nextChargeAt: Date | null, now = Date.now()) {
  if (stored >= MAX_CHARGES) return { charges: MAX_CHARGES, nextChargeAt: null as Date | null }
  if (!nextChargeAt)         return { charges: MAX_CHARGES, nextChargeAt: null as Date | null }

  const msUntilNext = nextChargeAt.getTime() - now
  if (msUntilNext > 0) return { charges: stored, nextChargeAt }

  const regenerated = Math.floor(Math.abs(msUntilNext) / CHARGE_MS) + 1
  const newCharges  = Math.min(MAX_CHARGES, stored + regenerated)
  if (newCharges >= MAX_CHARGES) return { charges: MAX_CHARGES, nextChargeAt: null as Date | null }

  const newNext = new Date(nextChargeAt.getTime() + regenerated * CHARGE_MS)
  return { charges: newCharges, nextChargeAt: newNext }
}
