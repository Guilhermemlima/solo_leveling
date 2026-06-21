'use client'
import { useEffect, useState } from 'react'
import { ShoppingBag, CheckCircle, Package } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Input'
import { useToast } from '@/components/ui/Toast'
import { useAuth } from '@/hooks/useAuth'
import { RARITY_COLORS, RARITY_LABELS, EQUIP_TYPE_LABELS } from '@/lib/game-logic'
import { OptimizedImage } from '@/components/ui/OptimizedImage'

const RANK_COLORS: Record<string, string> = {
  E: '#9ca3af', D: '#22c55e', C: '#3b82f6', B: '#8b5cf6', A: '#f59e0b', S: '#ec4899',
}

function StatsBadges({ description, color }: { description: string; color: string }) {
  const stats = description.split(/[.,]/).map(s => s.trim()).filter(s => /[+\-]\d/.test(s))
  if (stats.length === 0) return <p className="text-xs text-slate-400 mb-2">{description}</p>
  return (
    <div className="flex flex-wrap gap-1 mb-2">
      {stats.map((stat, i) => (
        <span key={i} className="text-[10px] font-semibold px-1.5 py-0.5 rounded" style={{ background: `${color}18`, color, border: `1px solid ${color}35` }}>
          {stat}
        </span>
      ))}
    </div>
  )
}

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

  const buyItem = async (item: any) => {
    setBuying(item.id)
    try {
      const endpoint = item.isFullSet ? '/api/shop/buy-set' : '/api/shop/buy'
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ equipmentId: item.id }),
      })
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
          <img src="/assets/items/moeda.png" alt="Moedas" className="w-5 h-5 object-contain" />
          <span className="font-bold text-amber-400">{user?.essences?.toLocaleString() || 0}</span>
          <span className="text-xs text-slate-500">Moedas</span>
        </div>
      </div>

      <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl text-xs text-amber-300/80">
        ⚠️ As Moedas e equipamentos aqui são fictícios e não possuem nenhum valor financeiro ou monetário real.
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
            const rankColor = item.rank ? RANK_COLORS[item.rank] : null
            const displayPrice = item.isFullSet ? (item.effectivePrice ?? item.price) : item.price
            const canAfford = user && user.essences >= displayPrice
            return (
              <div key={item.id} className={`glass rounded-2xl p-5 border transition-all duration-200 hover:scale-[1.02] ${item.owned ? 'opacity-60' : ''}`} style={{ borderColor: `${rarityColor}30` }}>
                <div className="flex items-start justify-between mb-3">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center overflow-hidden" style={{ background: `${rarityColor}15`, border: `1px solid ${rarityColor}30` }}>
                      {item.imageUrl ? (
                        <OptimizedImage src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-2xl">{item.icon}</span>
                      )}
                    </div>
                    {item.isFullSet && (
                      <span className="absolute -top-1.5 -right-1.5 text-[9px] font-bold px-1 py-0.5 rounded-full bg-amber-500 text-black leading-none">SET</span>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full border" style={{ color: rarityColor, borderColor: `${rarityColor}40` }}>
                      {RARITY_LABELS[item.rarity]}
                    </span>
                    {rankColor && item.rank && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ color: rankColor, background: `${rankColor}15`, border: `1px solid ${rankColor}30` }}>
                        Rank {item.rank}
                      </span>
                    )}
                  </div>
                </div>

                <h3 className="font-semibold mb-1" style={{ color: rarityColor }}>{item.name}</h3>
                <p className="text-xs text-slate-500 mb-2">
                  {item.isFullSet ? (
                    <span className="flex items-center gap-1">
                      <Package size={11} className="text-amber-400" />
                      <span className="text-amber-400 font-medium">Conjunto Completo</span>
                      {item.totalPieces > 0 && (
                        <span className="text-slate-600">· {item.ownedPieces ?? 0}/{item.totalPieces} peças</span>
                      )}
                    </span>
                  ) : (
                    <>{EQUIP_TYPE_LABELS[item.type]} · <span style={{ color: rarityColor }}>{RARITY_LABELS[item.rarity]}</span></>
                  )}
                </p>
                <StatsBadges description={item.description} color={rarityColor} />
                <div className="mb-3" />

                <div className="flex items-center justify-between">
                  <div className="flex flex-col items-start">
                    <div className="flex items-center gap-1.5">
                      <img src="/assets/items/moeda.png" alt="Moedas" className="w-3.5 h-3.5 object-contain" />
                      <span className="font-bold text-amber-400">{displayPrice.toLocaleString()}</span>
                    </div>
                    {item.isFullSet && (item.ownedPieces ?? 0) > 0 && !item.owned && (
                      <span className="text-[10px] text-slate-500 line-through ml-0.5">{item.price.toLocaleString()}</span>
                    )}
                  </div>
                  {item.owned ? (
                    <span className="flex items-center gap-1 text-xs text-emerald-400">
                      <CheckCircle size={13} /> {item.isFullSet ? 'Completo' : 'Possuído'}
                    </span>
                  ) : (
                    <Button
                      size="sm"
                      variant={canAfford ? 'primary' : 'secondary'}
                      disabled={!user || !canAfford}
                      loading={buying === item.id}
                      onClick={() => buyItem(item)}
                    >
                      {!canAfford ? 'Sem saldo' : item.isFullSet ? 'Comprar Conjunto' : 'Comprar'}
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
