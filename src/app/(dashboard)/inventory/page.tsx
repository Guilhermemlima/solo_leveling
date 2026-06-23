'use client'
import { CoinIcon } from '@/components/ui/CoinIcon'
import { useEffect, useState } from 'react'
import { Package, Shield, ShoppingBag, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'
import { useAuth } from '@/hooks/useAuth'
import { RARITY_COLORS, RARITY_LABELS, EQUIP_TYPE_LABELS } from '@/lib/game-logic'
import { OptimizedImage } from '@/components/ui/OptimizedImage'

const BONUS_LABELS: Record<string, string> = {
  strength: 'Força', vitality: 'Vitalidade', intelligence: 'Inteligência',
  focus: 'Foco', discipline: 'Disciplina', wisdom: 'Sabedoria',
  charisma: 'Carisma', creativity: 'Criatividade', hp: 'HP', atk: 'ATK', def: 'DEF',
}

const RARITY_SELL_MULT: Record<string, number> = {
  COMMON: 0.30, UNCOMMON: 0.35, RARE: 0.40, EPIC: 0.45, LEGENDARY: 0.50, MYTHIC: 0.55,
}

function sellPrice(inv: any): number {
  const mult = RARITY_SELL_MULT[inv.equipment.rarity] ?? 0.30
  const base = Math.max(1, Math.round(inv.equipment.price * mult))
  return base + Math.round(base * inv.upgradeLevel * 0.10)
}

export default function InventoryPage() {
  const [inventory, setInventory] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [equipping, setEquipping] = useState<string | null>(null)
  const [selling, setSelling] = useState<string | null>(null)
  const [confirmSell, setConfirmSell] = useState<any | null>(null)
  const { toast } = useToast()
  const { refreshUser } = useAuth()
  const router = useRouter()

  const fetchInventory = async () => {
    const res = await fetch('/api/inventory')
    if (res.ok) setInventory(await res.json())
    setLoading(false)
  }

  useEffect(() => { fetchInventory() }, [])

  const toggleEquip = async (invId: string) => {
    setEquipping(invId)
    try {
      const res = await fetch(`/api/inventory/${invId}/equip`, { method: 'POST' })
      const data = await res.json()
      if (!res.ok) { toast(data.error, 'error'); return }
      toast(data.message, 'success')
      fetchInventory()
      router.refresh()
    } catch { toast('Erro ao equipar', 'error') }
    finally { setEquipping(null) }
  }

  const sell = async (inv: any) => {
    setSelling(inv.id)
    setConfirmSell(null)
    try {
      const res = await fetch(`/api/inventory/${inv.id}/sell`, { method: 'POST' })
      const data = await res.json()
      if (!res.ok) { toast(data.error, 'error'); return }
      toast(data.message, 'success')
      router.refresh()
      await Promise.all([fetchInventory(), refreshUser()])
    } catch { toast('Erro ao vender', 'error') }
    finally { setSelling(null) }
  }

  const equipped = inventory.filter(i => i.isEquipped)
  const unequipped = inventory.filter(i => !i.isEquipped)

  return (
    <div className="space-y-6">
      {/* Confirm sell modal */}
      {confirmSell && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)' }}>
          <div className="glass neon-border rounded-2xl p-6 max-w-sm w-full space-y-4">
            <div className="flex items-start justify-between">
              <p className="font-bold text-white text-lg">Vender item?</p>
              <button onClick={() => setConfirmSell(null)} className="text-slate-500 hover:text-slate-300"><X size={18} /></button>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/60 border border-slate-700/40">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0"
                style={{ background: `${RARITY_COLORS[confirmSell.equipment.rarity]}15`, border: `1px solid ${RARITY_COLORS[confirmSell.equipment.rarity]}30` }}>
                {confirmSell.equipment.icon}
              </div>
              <div>
                <p className="font-semibold text-slate-200">{confirmSell.equipment.name}{confirmSell.upgradeLevel > 0 ? ` +${confirmSell.upgradeLevel}` : ''}</p>
                <p className="text-xs" style={{ color: RARITY_COLORS[confirmSell.equipment.rarity] }}>{RARITY_LABELS[confirmSell.equipment.rarity]}</p>
              </div>
            </div>
            <p className="text-sm text-slate-400 text-center">
              Você receberá <span className="text-amber-400 font-bold text-base">{sellPrice(confirmSell)} <CoinIcon /></span> Moedas pela venda.
              <br /><span className="text-xs text-slate-600">Esta ação não pode ser desfeita.</span>
            </p>
            <div className="flex gap-2">
              <Button variant="secondary" className="flex-1" onClick={() => setConfirmSell(null)}>Cancelar</Button>
              <Button
                variant="primary"
                className="flex-1"
                loading={selling === confirmSell.id}
                onClick={() => sell(confirmSell)}
                style={{ background: 'linear-gradient(135deg,#b45309,#92400e)' }}
              >
                <ShoppingBag size={14} /> Vender
              </Button>
            </div>
          </div>
        </div>
      )}

      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2"><Package className="text-indigo-400" /> Inventário</h1>
        <p className="text-slate-400 text-sm">{inventory.length} itens · {equipped.length} equipados</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" /></div>
      ) : inventory.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center border border-slate-700/30">
          <div className="text-5xl mb-4">🎒</div>
          <p className="text-slate-400">Seu inventário está vazio.</p>
          <p className="text-slate-500 text-sm mt-1">Visite a Loja para adquirir equipamentos!</p>
        </div>
      ) : (
        <>
          {equipped.length > 0 && (
            <div>
              <h2 className="font-semibold text-emerald-400 mb-3 flex items-center gap-2"><Shield size={16} /> Equipados</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {equipped.map(inv => (
                  <ItemCard key={inv.id} inv={inv}
                    onToggle={toggleEquip} loadingEquip={equipping === inv.id}
                    onSell={() => setConfirmSell(inv)} loadingSell={selling === inv.id}
                  />
                ))}
              </div>
            </div>
          )}
          {unequipped.length > 0 && (
            <div>
              <h2 className="font-semibold text-slate-300 mb-3">No Baú</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {unequipped.map(inv => (
                  <ItemCard key={inv.id} inv={inv}
                    onToggle={toggleEquip} loadingEquip={equipping === inv.id}
                    onSell={() => setConfirmSell(inv)} loadingSell={selling === inv.id}
                  />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

function StatsBadges({ description, color }: { description: string; color: string }) {
  const stats = description.split(/[.,]/).map(s => s.trim()).filter(s => /[+\-]\d/.test(s))
  if (stats.length === 0) return <p className="text-xs text-slate-400 mb-2">{description}</p>
  return (
    <div className="flex flex-wrap gap-1 mb-2">
      {stats.map((stat, i) => (
        <span key={i} className="text-[10px] font-semibold px-1.5 py-0.5 rounded"
          style={{ background: `${color}18`, color, border: `1px solid ${color}35` }}>
          {stat}
        </span>
      ))}
    </div>
  )
}

function ItemCard({ inv, onToggle, loadingEquip, onSell, loadingSell }: {
  inv: any
  onToggle: (id: string) => void
  loadingEquip: boolean
  onSell: () => void
  loadingSell: boolean
}) {
  const rarityColor = RARITY_COLORS[inv.equipment.rarity]
  const price = sellPrice(inv)

  return (
    <div className={`glass rounded-2xl p-5 border transition-all duration-200 ${inv.isEquipped ? 'border-emerald-500/30 bg-emerald-500/5' : ''}`}
      style={{ borderColor: inv.isEquipped ? undefined : `${rarityColor}25` }}>
      <div className="flex items-start justify-between mb-3">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center overflow-hidden"
          style={{ background: `${rarityColor}15`, border: `1px solid ${rarityColor}30` }}>
          {inv.equipment.imageUrl ? (
            <OptimizedImage src={inv.equipment.imageUrl} alt={inv.equipment.name} className="w-full h-full object-cover" />
          ) : (
            <span className="text-2xl">{inv.equipment.icon}</span>
          )}
        </div>
        <div className="flex flex-col items-end gap-1">
          {inv.isEquipped && (
            <span className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">Equipado</span>
          )}
          {inv.upgradeLevel > 0 && (
            <span className="text-xs font-bold px-2 py-0.5 rounded-full"
              style={{ color: rarityColor, background: `${rarityColor}15` }}>
              +{inv.upgradeLevel}
            </span>
          )}
        </div>
      </div>

      <h3 className="font-semibold mb-0.5" style={{ color: rarityColor }}>{inv.equipment.name}</h3>
      <p className="text-xs text-slate-500 mb-2">
        {EQUIP_TYPE_LABELS[inv.equipment.type]} · <span style={{ color: rarityColor }}>{RARITY_LABELS[inv.equipment.rarity]}</span>
      </p>
      <StatsBadges description={inv.equipment.description} color={rarityColor} />

      {inv.durability !== undefined && inv.durability < inv.durabilityMax && (
        <div className="mb-2">
          <div className="h-1 rounded-full bg-slate-700/50 overflow-hidden">
            <div className="h-full rounded-full bg-amber-500"
              style={{ width: `${Math.round(inv.durability / inv.durabilityMax * 100)}%` }} />
          </div>
          <p className="text-[10px] text-slate-500 mt-0.5">Durabilidade {inv.durability}/{inv.durabilityMax}</p>
        </div>
      )}

      <div className="mt-3 flex gap-2">
        <Button size="sm" variant={inv.isEquipped ? 'secondary' : 'primary'}
          loading={loadingEquip} onClick={() => onToggle(inv.id)} className="flex-1">
          {inv.isEquipped ? 'Desequipar' : 'Equipar'}
        </Button>
        {!inv.isEquipped && (
          <button
            onClick={onSell}
            disabled={loadingSell}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-amber-500/25 bg-amber-500/8 hover:bg-amber-500/18 text-amber-400 text-xs font-semibold transition-all disabled:opacity-50"
            title={`Vender por ${price} moedas`}
          >
            <ShoppingBag size={12} />
            {price} <CoinIcon />
          </button>
        )}
      </div>
    </div>
  )
}
