'use client'
import { useEffect, useState } from 'react'
import { Package, Shield } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'
import { RARITY_COLORS, RARITY_LABELS, EQUIP_TYPE_LABELS } from '@/lib/game-logic'

export default function InventoryPage() {
  const [inventory, setInventory] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [equipping, setEquipping] = useState<string | null>(null)
  const { toast } = useToast()

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
    } catch { toast('Erro ao equipar', 'error') }
    finally { setEquipping(null) }
  }

  const equipped = inventory.filter(i => i.isEquipped)
  const unequipped = inventory.filter(i => !i.isEquipped)

  return (
    <div className="space-y-6">
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
                {equipped.map(inv => <ItemCard key={inv.id} inv={inv} onToggle={toggleEquip} loading={equipping === inv.id} />)}
              </div>
            </div>
          )}
          {unequipped.length > 0 && (
            <div>
              <h2 className="font-semibold text-slate-300 mb-3">No Baú</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {unequipped.map(inv => <ItemCard key={inv.id} inv={inv} onToggle={toggleEquip} loading={equipping === inv.id} />)}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

function ItemCard({ inv, onToggle, loading }: { inv: any; onToggle: (id: string) => void; loading: boolean }) {
  const rarityColor = RARITY_COLORS[inv.equipment.rarity]
  return (
    <div className={`glass rounded-2xl p-5 border transition-all duration-200 ${inv.isEquipped ? 'border-emerald-500/30 bg-emerald-500/5' : ''}`} style={{ borderColor: inv.isEquipped ? undefined : `${rarityColor}25` }}>
      <div className="flex items-start justify-between mb-3">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl" style={{ background: `${rarityColor}15`, border: `1px solid ${rarityColor}30` }}>
          {inv.equipment.icon}
        </div>
        {inv.isEquipped && <span className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">Equipado</span>}
      </div>
      <h3 className="font-semibold text-slate-200 mb-0.5" style={{ color: rarityColor }}>{inv.equipment.name}</h3>
      <p className="text-xs text-slate-500 mb-0.5">{EQUIP_TYPE_LABELS[inv.equipment.type]} · <span style={{ color: rarityColor }}>{RARITY_LABELS[inv.equipment.rarity]}</span></p>
      <p className="text-xs text-slate-400 mb-4">{inv.equipment.description}</p>
      <Button size="sm" variant={inv.isEquipped ? 'secondary' : 'primary'} loading={loading} onClick={() => onToggle(inv.id)} className="w-full">
        {inv.isEquipped ? 'Desequipar' : 'Equipar'}
      </Button>
    </div>
  )
}
