'use client'
import { useEffect, useState } from 'react'
import { ShoppingBag, Coins, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Input'
import { useToast } from '@/components/ui/Toast'
import { useAuth } from '@/hooks/useAuth'
import { RARITY_COLORS, RARITY_LABELS, EQUIP_TYPE_LABELS } from '@/lib/game-logic'

export default function ShopPage() {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [buying, setBuying] = useState<string | null>(null)
  const [filterRarity, setFilterRarity] = useState('')
  const [filterType, setFilterType] = useState('')
  const { user, refreshUser } = useAuth()
  const { toast } = useToast()

  const fetchItems = async () => {
    const p = new URLSearchParams()
    if (filterRarity) p.set('rarity', filterRarity)
    if (filterType) p.set('type', filterType)
    const res = await fetch(`/api/shop?${p}`)
    if (res.ok) setItems(await res.json())
    setLoading(false)
  }

  useEffect(() => { fetchItems() }, [filterRarity, filterType])

  const buyItem = async (equipmentId: string) => {
    setBuying(equipmentId)
    try {
      const res = await fetch('/api/shop/buy', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ equipmentId }) })
      const data = await res.json()
      if (!res.ok) { toast(data.error, 'error'); return }
      toast(data.message, 'success')
      await Promise.all([fetchItems(), refreshUser()])
    } catch { toast('Erro na compra', 'error') }
    finally { setBuying(null) }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2"><ShoppingBag className="text-indigo-400" /> Loja de Equipamentos</h1>
          <p className="text-slate-400 text-sm">Equipamentos fictícios — sem valor monetário real</p>
        </div>
        <div className="glass border border-amber-500/30 rounded-xl px-4 py-2 flex items-center gap-2">
          <Coins size={16} className="text-amber-400" />
          <span className="font-bold text-amber-400">{user?.essences?.toLocaleString() || 0}</span>
          <span className="text-xs text-slate-500">Essências</span>
        </div>
      </div>

      <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl text-xs text-amber-300/80">
        ⚠️ As Essências e equipamentos aqui são fictícios e não possuem nenhum valor financeiro ou monetário real.
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <Select value={filterRarity} onChange={e => setFilterRarity(e.target.value)} className="w-auto min-w-36">
          <option value="">Todas raridades</option>
          {Object.entries(RARITY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </Select>
        <Select value={filterType} onChange={e => setFilterType(e.target.value)} className="w-auto min-w-36">
          <option value="">Todos tipos</option>
          {Object.entries(EQUIP_TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </Select>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" /></div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map(item => {
            const rarityColor = RARITY_COLORS[item.rarity]
            return (
              <div key={item.id} className={`glass rounded-2xl p-5 border transition-all duration-200 hover:scale-[1.02] ${item.owned ? 'opacity-60' : ''}`} style={{ borderColor: `${rarityColor}30` }}>
                <div className="flex items-start justify-between mb-3">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl" style={{ background: `${rarityColor}15`, border: `1px solid ${rarityColor}30` }}>
                    {item.icon}
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full border" style={{ color: rarityColor, borderColor: `${rarityColor}40` }}>
                      {RARITY_LABELS[item.rarity]}
                    </span>
                  </div>
                </div>

                <h3 className="font-semibold text-slate-200 mb-1" style={{ color: rarityColor }}>{item.name}</h3>
                <p className="text-xs text-slate-500 mb-1">{EQUIP_TYPE_LABELS[item.type]}</p>
                <p className="text-xs text-slate-400 mb-4">{item.description}</p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Coins size={14} className="text-amber-400" />
                    <span className="font-bold text-amber-400">{item.price}</span>
                  </div>
                  {item.owned ? (
                    <span className="flex items-center gap-1 text-xs text-emerald-400"><CheckCircle size={13} /> Possuído</span>
                  ) : (
                    <Button
                      size="sm"
                      variant={user && user.essences >= item.price ? 'primary' : 'secondary'}
                      disabled={!user || user.essences < item.price}
                      loading={buying === item.id}
                      onClick={() => buyItem(item.id)}
                    >
                      {user && user.essences < item.price ? 'Sem saldo' : 'Comprar'}
                    </Button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
