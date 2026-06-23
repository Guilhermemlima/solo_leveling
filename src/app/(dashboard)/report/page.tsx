'use client'
import { useEffect, useState, useRef } from 'react'
import { Star, Sword, Shield, Trophy, Flame, Zap, Target, Download, CheckCircle } from 'lucide-react'
import { CATEGORY_LABELS, CATEGORY_ICONS, RARITY_COLORS, RARITY_LABELS, EQUIP_TYPE_LABELS } from '@/lib/game-logic'

const RANK_COLORS: Record<string, string> = { E: '#9ca3af', D: '#22c55e', C: '#3b82f6', B: '#8b5cf6', A: '#f59e0b', S: '#ef4444', SS: '#ec4899', SSS: '#fbbf24' }
const SPEC_LABELS: Record<string, string> = { ARCHITECT: 'Arquiteto', WARRIOR: 'Guerreiro', SAGE: 'Sábio', SHADOW: 'Sombra', HEALER: 'Curandeiro' }
const ATTR_LABELS: Record<string, string> = { strength: 'Força', vitality: 'Vitalidade', intelligence: 'Inteligência', focus: 'Foco', discipline: 'Disciplina', charisma: 'Carisma', wisdom: 'Sabedoria', creativity: 'Criatividade' }
const ATTR_ICONS: Record<string, string> = { strength: '⚔️', vitality: '❤️', intelligence: '🧠', focus: '🎯', discipline: '🔥', charisma: '✨', wisdom: '📖', creativity: '🎨' }

type DownloadState = 'idle' | 'loading-data' | 'rendering' | 'done' | 'error'

export default function ReportPage() {
  const [data, setData] = useState<any>(null)
  const [dlState, setDlState] = useState<DownloadState>('loading-data')
  const [dlMsg, setDlMsg] = useState('Buscando seus dados...')
  const reportRef = useRef<HTMLDivElement>(null)
  const hasGenerated = useRef(false)

  useEffect(() => {
    fetch('/api/user/report')
      .then(r => r.json())
      .then(d => {
        setData(d)
        setDlState('rendering')
        setDlMsg('Montando o relatório...')
      })
      .catch(() => {
        setDlState('error')
        setDlMsg('Erro ao carregar dados.')
      })
  }, [])

  // Auto-trigger PDF after data renders
  useEffect(() => {
    if (!data || dlState !== 'rendering' || hasGenerated.current) return
    hasGenerated.current = true

    // Wait a tick for the DOM to paint
    const timer = setTimeout(() => {
      generatePdf(data, reportRef, setDlState, setDlMsg)
    }, 600)
    return () => clearTimeout(timer)
  }, [data, dlState])

  return (
    <div className="min-h-screen bg-[#050816] flex flex-col items-center justify-start">

      {/* Status overlay */}
      <div className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-6 pointer-events-none">
        <div className={`flex items-center gap-3 px-6 py-3 rounded-2xl border shadow-2xl backdrop-blur-sm pointer-events-auto transition-all duration-500 ${
          dlState === 'done' ? 'border-emerald-500/40 bg-emerald-500/10' :
          dlState === 'error' ? 'border-red-500/40 bg-red-500/10' :
          'border-purple-500/40 bg-purple-500/10'
        }`}>
          {dlState === 'done' ? (
            <CheckCircle size={18} className="text-emerald-400" />
          ) : dlState === 'error' ? (
            <span className="text-red-400 text-lg">✗</span>
          ) : (
            <div className="w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
          )}
          <span className={`text-sm font-semibold ${
            dlState === 'done' ? 'text-emerald-300' :
            dlState === 'error' ? 'text-red-300' :
            'text-purple-300'
          }`}>{dlMsg}</span>
          {dlState === 'done' && (
            <button
              onClick={() => data && generatePdf(data, reportRef, setDlState, setDlMsg)}
              className="ml-2 flex items-center gap-1.5 text-xs text-emerald-400 hover:text-white underline underline-offset-2"
            >
              <Download size={12} /> Baixar novamente
            </button>
          )}
        </div>
      </div>

      {/* Hidden report canvas */}
      {data && (
        <div
          ref={reportRef}
          style={{ position: 'absolute', left: '-9999px', top: 0, width: '794px', background: '#050816', fontFamily: 'Inter, Arial, sans-serif' }}
          aria-hidden="true"
        >
          <ReportContent data={data} />
        </div>
      )}

      {/* Preview visible on screen */}
      {data ? (
        <div className="w-full max-w-3xl mx-auto mt-24 mb-12 rounded-3xl overflow-hidden border border-purple-500/20 shadow-2xl" style={{ background: '#050816' }}>
          <ReportContent data={data} />
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center min-h-screen gap-4">
          <div className="w-12 h-12 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">{dlMsg}</p>
        </div>
      )}
    </div>
  )
}

async function generatePdf(
  data: any,
  ref: React.RefObject<HTMLDivElement | null>,
  setState: (s: DownloadState) => void,
  setMsg: (m: string) => void,
) {
  try {
    setState('rendering')
    setMsg('Capturando o relatório...')

    const el = ref.current
    if (!el) throw new Error('no element')

    const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
      import('html2canvas'),
      import('jspdf'),
    ])

    setMsg('Renderizando páginas...')

    const canvas = await html2canvas(el, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#050816',
      logging: false,
      windowWidth: 794,
    })

    setMsg('Compondo o PDF...')

    const imgData = canvas.toDataURL('image/jpeg', 0.95)
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })

    const pdfW = pdf.internal.pageSize.getWidth()
    const pdfH = pdf.internal.pageSize.getHeight()
    const imgH = (canvas.height * pdfW) / canvas.width

    let remaining = imgH
    let yOffset = 0

    while (remaining > 0) {
      if (yOffset > 0) pdf.addPage()
      pdf.addImage(imgData, 'JPEG', 0, -yOffset, pdfW, imgH)
      yOffset += pdfH
      remaining -= pdfH
    }

    const userName = data?.user?.name?.replace(/\s+/g, '_') ?? 'Caçador'
    const date = new Date().toISOString().slice(0, 10)
    pdf.save(`Ascend_Relatorio_${userName}_${date}.pdf`)

    setState('done')
    setMsg(`PDF salvo: Ascend_Relatorio_${userName}_${date}.pdf`)
  } catch (err) {
    console.error(err)
    setState('error')
    setMsg('Erro ao gerar PDF. Tente novamente.')
  }
}

function ReportContent({ data }: { data: any }) {
  const { user, attributes, stats, achievements, inventory, recentActivity, recentBattles } = data
  const rankColor = RANK_COLORS[user.rank] || '#9ca3af'
  const attrEntries = attributes ? Object.entries(ATTR_LABELS).map(([key, label]) => ({
    key, label, icon: ATTR_ICONS[key], value: (attributes as any)[key] ?? 0,
  })) : []
  const maxAttr = Math.max(...attrEntries.map(a => a.value), 1)
  const topCategory = Object.entries(stats.byCategory as Record<string, number>).sort((a, b) => b[1] - a[1])[0]
  const completionRate = stats.totalTasks > 0 ? Math.round((stats.completedTasks / stats.totalTasks) * 100) : 0

  return (
    <div style={{ color: '#f1f5f9', padding: '0' }}>

      {/* === PAGE 1 === */}
      <div style={{ minHeight: '1123px', padding: '48px', background: 'linear-gradient(135deg,#050816 0%,#0d0d2b 60%,#050816 100%)', borderBottom: '1px solid rgba(139,92,246,0.25)', position: 'relative' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '32px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <span style={{ fontSize: '36px' }}>⚡</span>
              <div>
                <p style={{ fontSize: '11px', color: '#a78bfa', letterSpacing: '0.25em', fontWeight: 700, textTransform: 'uppercase', margin: 0 }}>Ascend System</p>
                <p style={{ fontSize: '10px', color: '#64748b', letterSpacing: '0.15em', margin: 0 }}>Relatório de Evolução Pessoal</p>
              </div>
            </div>
            <h1 style={{ fontSize: '44px', fontWeight: 900, margin: '0 0 4px', letterSpacing: '-1px', textShadow: '0 0 40px rgba(139,92,246,0.6)' }}>{user.name}</h1>
            <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0 }}>
              {user.email} · Membro desde {new Date(user.createdAt).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
            </p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: '90px', height: '90px', borderRadius: '16px', border: `2px solid ${rankColor}`, background: `${rankColor}18`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', boxShadow: `0 0 30px ${rankColor}40`, marginBottom: '8px' }}>
              <span style={{ fontSize: '28px', fontWeight: 900, color: rankColor, lineHeight: 1 }}>{user.rank}</span>
              <span style={{ fontSize: '9px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px' }}>Patente</span>
            </div>
            <p style={{ fontSize: '20px', fontWeight: 900, margin: '0 0 2px' }}>Nível {user.level}</p>
            <p style={{ fontSize: '11px', color: '#94a3b8', margin: 0 }}>{SPEC_LABELS[user.specialization] || user.specialization}</p>
          </div>
        </div>

        {/* XP bar */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#64748b', marginBottom: '6px' }}>
            <span>EXP Acumulado</span>
            <span style={{ color: '#a78bfa', fontWeight: 700 }}>{(user.totalXp ?? 0).toLocaleString('pt-BR')} XP total · Sequência: {user.streak} dias</span>
          </div>
          <div style={{ height: '8px', borderRadius: '4px', background: '#1e293b', overflow: 'hidden' }}>
            <div style={{ height: '100%', borderRadius: '4px', background: 'linear-gradient(90deg,#6366f1,#8b5cf6,#ec4899)', width: '100%' }} />
          </div>
          <p style={{ fontSize: '10px', color: '#475569', margin: '4px 0 0', textAlign: 'right' }}>
            Gerado em {new Date(data.generatedAt).toLocaleString('pt-BR')}
          </p>
        </div>

        {/* Stats grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '16px', marginBottom: '28px' }}>
          {[
            { label: 'Tarefas Concluídas', value: stats.completedTasks, sub: `de ${stats.totalTasks} · ${completionRate}%`, color: '#22c55e' },
            { label: 'Streak Atual', value: `${user.streak}d`, sub: `${(user.essences ?? 0).toLocaleString('pt-BR')} Moedas`, color: '#f59e0b' },
            { label: 'Vitórias Arena', value: stats.arenaWins, sub: `${stats.arenaTotal} batalhas`, color: '#ef4444' },
            { label: 'Conquistas', value: stats.achievementsUnlocked, sub: `${stats.missionsCompleted} missões`, color: '#8b5cf6' },
          ].map((s, i) => (
            <div key={i} style={{ borderRadius: '14px', padding: '16px', border: `1px solid ${s.color}30`, background: `${s.color}0a` }}>
              <p style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: s.color, margin: '0 0 8px' }}>{s.label}</p>
              <p style={{ fontSize: '28px', fontWeight: 900, color: '#f8fafc', margin: '0 0 4px', lineHeight: 1 }}>{s.value}</p>
              <p style={{ fontSize: '10px', color: '#64748b', margin: 0 }}>{s.sub}</p>
            </div>
          ))}
        </div>

        {/* Category breakdown */}
        <div>
          <p style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            ⭐ Tarefas por Categoria
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px' }}>
            {Object.entries(stats.byCategory as Record<string, number>)
              .sort((a, b) => b[1] - a[1])
              .map(([cat, count]) => (
                <div key={cat} style={{ borderRadius: '12px', padding: '12px 8px', border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.03)', textAlign: 'center' }}>
                  <div style={{ fontSize: '22px', marginBottom: '6px' }}>{(CATEGORY_ICONS as any)[cat] || '📋'}</div>
                  <p style={{ fontSize: '18px', fontWeight: 900, color: '#f8fafc', margin: '0 0 2px', lineHeight: 1 }}>{count as number}</p>
                  <p style={{ fontSize: '9px', color: '#64748b', margin: 0 }}>{(CATEGORY_LABELS as any)[cat] || cat}</p>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* === PAGE 2 === */}
      <div style={{ minHeight: '1123px', padding: '48px', background: 'linear-gradient(135deg,#050816 0%,#0a0a20 60%,#050816 100%)', borderBottom: '1px solid rgba(139,92,246,0.25)' }}>
        <p style={{ fontSize: '10px', color: '#a78bfa', letterSpacing: '0.25em', fontWeight: 700, textTransform: 'uppercase', margin: '0 0 32px' }}>
          Ascend System · {user.name} · Nível {user.level}
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
          {/* Attributes */}
          <div>
            <p style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 20px' }}>⚡ Atributos do Caçador</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
              {attrEntries.sort((a, b) => b.value - a.value).map(attr => {
                const pct = maxAttr > 0 ? (attr.value / maxAttr) * 100 : 0
                const barColor = pct >= 80 ? '#ec4899' : pct >= 60 ? '#8b5cf6' : pct >= 40 ? '#3b82f6' : pct >= 20 ? '#22c55e' : '#6b7280'
                return (
                  <div key={attr.key}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontSize: '12px', color: '#cbd5e1' }}>{attr.icon} {attr.label}</span>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: '#f8fafc' }}>{attr.value}</span>
                    </div>
                    <div style={{ height: '10px', borderRadius: '5px', background: '#1e293b', overflow: 'hidden' }}>
                      <div style={{ height: '100%', borderRadius: '5px', width: `${Math.max(pct, 2)}%`, background: barColor, boxShadow: `0 0 8px ${barColor}80` }} />
                    </div>
                  </div>
                )
              })}
            </div>

            {topCategory && (
              <div style={{ padding: '16px', borderRadius: '14px', border: '1px solid rgba(245,158,11,0.3)', background: 'rgba(245,158,11,0.06)', marginBottom: '16px' }}>
                <p style={{ fontSize: '10px', color: '#f59e0b', fontWeight: 700, textTransform: 'uppercase', margin: '0 0 6px', letterSpacing: '0.1em' }}>Especialidade Dominante</p>
                <p style={{ fontSize: '22px', fontWeight: 900, margin: '0 0 2px' }}>{(CATEGORY_ICONS as any)[topCategory[0]]} {(CATEGORY_LABELS as any)[topCategory[0]]}</p>
                <p style={{ fontSize: '11px', color: '#64748b', margin: 0 }}>{topCategory[1]} tarefas concluídas</p>
              </div>
            )}

            {user.selectedClass && (
              <div style={{ padding: '16px', borderRadius: '14px', border: '1px solid rgba(99,102,241,0.3)', background: 'rgba(99,102,241,0.06)' }}>
                <p style={{ fontSize: '10px', color: '#818cf8', fontWeight: 700, textTransform: 'uppercase', margin: '0 0 6px', letterSpacing: '0.1em' }}>Classe Ativa</p>
                <p style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 2px' }}>{user.selectedClass.icon} {user.selectedClass.name}</p>
                <p style={{ fontSize: '10px', color: '#64748b', margin: 0 }}>{user.selectedClass.description}</p>
              </div>
            )}
          </div>

          {/* Equipment */}
          <div>
            <p style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 20px' }}>
              🛡️ Equipamentos ({inventory.length} · {stats.equippedItems} equipados)
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[...inventory].sort((a: any, b: any) => {
                const order = ['MYTHIC','LEGENDARY','EPIC','RARE','UNCOMMON','COMMON']
                return order.indexOf(a.rarity) - order.indexOf(b.rarity)
              }).slice(0, 14).map((item: any, i: number) => {
                const color = RARITY_COLORS[item.rarity] || '#9ca3af'
                return (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '10px', border: `1px solid ${color}22`, background: `${color}08` }}>
                    <span style={{ fontSize: '18px', width: '24px', textAlign: 'center' }}>{item.icon}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: '12px', fontWeight: 700, color, margin: '0 0 1px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {item.name}{item.upgradeLevel > 0 ? ` +${item.upgradeLevel}` : ''}
                      </p>
                      <p style={{ fontSize: '9px', color: '#64748b', margin: 0 }}>{(EQUIP_TYPE_LABELS as any)[item.type]} · {(RARITY_LABELS as any)[item.rarity]}</p>
                    </div>
                    {item.isEquipped && (
                      <span style={{ fontSize: '9px', color: '#34d399', background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.25)', padding: '2px 6px', borderRadius: '20px', whiteSpace: 'nowrap' }}>Equipado</span>
                    )}
                  </div>
                )
              })}
            </div>
            {inventory.length > 14 && (
              <p style={{ fontSize: '10px', color: '#475569', margin: '8px 0 0', textAlign: 'center' }}>+{inventory.length - 14} outros itens</p>
            )}
          </div>
        </div>

        {/* Achievements */}
        {achievements.length > 0 && (
          <div style={{ marginTop: '32px' }}>
            <p style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 16px' }}>🏆 Conquistas Desbloqueadas ({achievements.length})</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px' }}>
              {achievements.slice(0, 10).map((ach: any, i: number) => (
                <div key={i} style={{ borderRadius: '12px', padding: '12px 8px', border: '1px solid rgba(245,158,11,0.2)', background: 'rgba(245,158,11,0.05)', textAlign: 'center' }}>
                  <div style={{ fontSize: '22px', marginBottom: '6px' }}>{ach.icon}</div>
                  <p style={{ fontSize: '10px', fontWeight: 700, color: '#fbbf24', margin: '0 0 2px' }}>{ach.name}</p>
                  <p style={{ fontSize: '9px', color: '#64748b', margin: 0 }}>{ach.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* === PAGE 3 === */}
      <div style={{ minHeight: '1123px', padding: '48px', background: 'linear-gradient(135deg,#050816 0%,#0a0a20 60%,#050816 100%)' }}>
        <p style={{ fontSize: '10px', color: '#a78bfa', letterSpacing: '0.25em', fontWeight: 700, textTransform: 'uppercase', margin: '0 0 32px' }}>
          Ascend System · {user.name} · Histórico de Atividade
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
          {/* Activity */}
          <div>
            <p style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 16px' }}>🔥 Atividade Recente</p>

            {/* Heatmap */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', marginBottom: '12px' }}>
              {Array.from({ length: 30 }).map((_, idx) => {
                const day = recentActivity[29 - idx]
                const xp = day?.xpChange ?? 0
                const bg = xp === 0 ? '#1e293b' : xp < 20 ? '#14532d' : xp < 50 ? '#166534' : xp < 100 ? '#15803d' : '#22c55e'
                return (
                  <div key={idx} style={{ aspectRatio: '1', borderRadius: '3px', background: bg, border: '1px solid rgba(255,255,255,0.04)' }} />
                )
              })}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '9px', color: '#475569', marginBottom: '20px' }}>
              <span>Menos</span>
              {['#1e293b','#14532d','#166534','#15803d','#22c55e'].map((c, i) => (
                <div key={i} style={{ width: '10px', height: '10px', borderRadius: '2px', background: c }} />
              ))}
              <span>Mais atividade</span>
            </div>

            {/* Activity log */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {recentActivity.slice(0, 10).map((a: any, i: number) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 12px', borderRadius: '10px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <span style={{ fontSize: '10px', color: '#475569', width: '72px', flexShrink: 0 }}>
                    {new Date(a.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                  </span>
                  <span style={{ fontSize: '11px', color: '#cbd5e1', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.description}</span>
                  {a.xpChange > 0 && <span style={{ fontSize: '10px', color: '#a78bfa', flexShrink: 0 }}>+{a.xpChange} XP</span>}
                  {a.essenceChange > 0 && <span style={{ fontSize: '10px', color: '#fbbf24', flexShrink: 0 }}>+{a.essenceChange}</span>}
                </div>
              ))}
            </div>
          </div>

          {/* Battles */}
          <div>
            {recentBattles.length > 0 && (
              <>
                <p style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 16px' }}>⚔️ Arena PvP</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '28px' }}>
                  {recentBattles.map((b: any, i: number) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '10px', border: `1px solid ${b.result === 'WIN' ? 'rgba(34,197,94,0.25)' : 'rgba(239,68,68,0.25)'}`, background: b.result === 'WIN' ? 'rgba(34,197,94,0.06)' : 'rgba(239,68,68,0.06)' }}>
                      <span style={{ fontSize: '10px', fontWeight: 900, padding: '2px 8px', borderRadius: '20px', color: b.result === 'WIN' ? '#4ade80' : '#f87171', background: b.result === 'WIN' ? 'rgba(74,222,128,0.15)' : 'rgba(248,113,113,0.15)', flexShrink: 0 }}>
                        {b.result === 'WIN' ? 'WIN' : 'LOSS'}
                      </span>
                      <span style={{ fontSize: '12px', color: '#cbd5e1', flex: 1 }}>{b.opponentName}</span>
                      {b.xpEarned > 0 && <span style={{ fontSize: '10px', color: '#a78bfa' }}>+{b.xpEarned} XP</span>}
                      <span style={{ fontSize: '9px', color: '#475569' }}>{new Date(b.createdAt).toLocaleDateString('pt-BR')}</span>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Summary card */}
            <div style={{ padding: '24px', borderRadius: '16px', border: '1px solid rgba(139,92,246,0.3)', background: 'rgba(139,92,246,0.06)' }}>
              <p style={{ fontSize: '12px', color: '#a78bfa', fontWeight: 700, margin: '0 0 16px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Resumo Final</p>
              {[
                { label: 'XP Total Acumulado', value: `${(user.totalXp ?? 0).toLocaleString('pt-BR')} XP` },
                { label: 'Melhor Sequência', value: `${user.bestStreak ?? user.streak} dias` },
                { label: 'Taxa de Conclusão', value: `${completionRate}%` },
                { label: 'Itens no Inventário', value: `${inventory.length} itens` },
                { label: 'Win Rate Arena', value: stats.arenaTotal > 0 ? `${Math.round(stats.arenaWins / stats.arenaTotal * 100)}%` : 'N/A' },
                { label: 'Conquistas', value: `${stats.achievementsUnlocked} desbloqueadas` },
              ].map((r, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: i < 5 ? '1px solid rgba(255,255,255,0.06)' : undefined }}>
                  <span style={{ fontSize: '12px', color: '#94a3b8' }}>{r.label}</span>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#f8fafc' }}>{r.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ marginTop: '40px', paddingTop: '20px', borderTop: '1px solid rgba(139,92,246,0.2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '24px' }}>⚡</span>
            <div>
              <p style={{ fontSize: '11px', color: '#a78bfa', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.2em', margin: 0 }}>Ascend System</p>
              <p style={{ fontSize: '9px', color: '#475569', margin: 0 }}>Desperte seu poder. Evolua todos os dias.</p>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: '10px', color: '#475569', margin: 0 }}>Relatório de {user.name}</p>
            <p style={{ fontSize: '9px', color: '#334155', margin: 0 }}>{new Date(data.generatedAt).toLocaleString('pt-BR')}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
