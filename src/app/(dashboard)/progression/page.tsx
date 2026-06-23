'use client'
import { useEffect, useState } from 'react'
import { BrainCircuit, Calculator, Shield, Sparkles } from 'lucide-react'
import { SPECIALIZATIONS } from '@/lib/specializations'

export default function ProgressionPage() {
  const [data, setData] = useState<any>(null)
  useEffect(() => { fetch('/api/system/transparency').then(r => r.json()).then(setData) }, [])
  return <div className="space-y-6">
    <div><h1 className="text-2xl font-bold text-white flex items-center gap-2"><BrainCircuit className="text-cyan-400" /> Progressão transparente</h1>
      <p className="text-sm text-slate-400">Veja exatamente por que seu personagem evolui e como cada número é calculado.</p></div>
    <section className="grid md:grid-cols-2 gap-4">
      <Card icon={<Calculator />} title="Níveis e recompensas">
        <p>{data?.levels?.formula}</p>
        <p>Fácil 10 XP · Média 25 XP · Difícil 50 XP · Extrema 100 XP</p>
        <p>Cada nível concede 50 Moedas extras.</p>
      </Card>
      <Card icon={<Shield />} title="Poder de combate">
        <p><b>HP:</b> {data?.combat?.hp}</p><p><b>Ataque:</b> {data?.combat?.attack}</p>
        <p><b>Defesa:</b> {data?.combat?.defense}</p><p><b>Crítico:</b> {data?.combat?.critical}</p>
      </Card>
    </section>
    <section><h2 className="font-semibold text-white mb-3 flex items-center gap-2"><Sparkles size={17} /> Especializações</h2>
      <div className="grid md:grid-cols-2 gap-3">{SPECIALIZATIONS.map(item => <div key={item.key} className="glass rounded-2xl p-4 border border-slate-700/50">
        <div className="flex gap-3"><span className="text-2xl">{item.icon}</span><div><h3 className="font-semibold" style={{ color: item.color }}>{item.name}</h3><p className="text-xs text-slate-500">{item.description}</p></div></div>
        <ul className="mt-3 text-xs text-slate-400 space-y-1">{item.perks.map(perk => <li key={perk}>• {perk}</li>)}</ul>
      </div>)}</div>
    </section>
    <section className="glass rounded-2xl p-5 border border-slate-700/50">
      <h2 className="font-semibold text-white mb-3">Faixas de patente</h2>
      <div className="grid grid-cols-3 md:grid-cols-6 gap-2">{data?.ranks?.map((rank: any) => <div key={rank.tier} className="text-center rounded-xl p-3 bg-slate-900/50">
        <p className="text-xl font-black" style={{ color: rank.color }}>{rank.tier}</p><p className="text-[11px] text-slate-500">{rank.min}+ pts</p>
      </div>)}</div>
    </section>
  </div>
}

function Card({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return <div className="glass rounded-2xl p-5 border border-slate-700/50"><div className="text-indigo-400 mb-2">{icon}</div><h2 className="font-semibold text-white mb-3">{title}</h2><div className="space-y-2 text-sm text-slate-400">{children}</div></div>
}
