'use client'

export function EvolutionAvatar({ name, avatarUrl, level, size = 'lg' }: {
  name: string
  avatarUrl?: string | null
  level: number
  size?: 'sm' | 'lg'
}) {
  const stage = level >= 30 ? 4 : level >= 15 ? 3 : level >= 5 ? 2 : 1
  const colors = [
    ['#475569', '#6366f1'],
    ['#6366f1', '#8b5cf6'],
    ['#8b5cf6', '#ec4899'],
    ['#f59e0b', '#ec4899'],
  ][stage - 1]
  const dimension = size === 'lg' ? 'w-24 h-24 text-4xl rounded-2xl' : 'w-11 h-11 text-lg rounded-xl'
  return <div className={`relative ${dimension} flex items-center justify-center font-bold text-white shrink-0`}>
    <span className="absolute inset-[-5px] rounded-[inherit] opacity-60 blur-md animate-pulse" style={{ background: `linear-gradient(135deg, ${colors[0]}, ${colors[1]})` }} />
    <span className="absolute inset-0 rounded-[inherit] border-2" style={{ background: `linear-gradient(135deg, ${colors[0]}44, ${colors[1]}44)`, borderColor: `${colors[1]}99` }} />
    {avatarUrl ? <img src={avatarUrl} alt={name} className="relative w-full h-full rounded-[inherit] object-cover" /> : <span className="relative">{name.charAt(0).toUpperCase()}</span>}
    <span className="absolute -bottom-2 px-2 py-0.5 rounded-full bg-[#090914] border text-[9px] uppercase tracking-wider" style={{ borderColor: colors[1], color: colors[1] }}>Estágio {stage}</span>
  </div>
}
