'use client'

interface XPBarProps {
  currentXp: number
  xpForNextLevel: number
  level: number
  showLabel?: boolean
  className?: string
}

export function XPBar({ currentXp, xpForNextLevel, level, showLabel = true, className = '' }: XPBarProps) {
  const percent = Math.min((currentXp / xpForNextLevel) * 100, 100)

  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex justify-between items-center mb-1.5 text-xs">
          <span className="text-indigo-400 font-semibold">Nível {level}</span>
          <span className="text-slate-400">{currentXp.toLocaleString()} / {xpForNextLevel.toLocaleString()} XP</span>
        </div>
      )}
      <div className="h-2.5 bg-slate-800/80 rounded-full overflow-hidden relative">
        <div
          className="h-full rounded-full relative overflow-hidden transition-all duration-1000 ease-out"
          style={{
            width: `${percent}%`,
            background: 'linear-gradient(90deg, #4f46e5, #7c3aed, #6366f1)',
          }}
        >
          <div className="absolute inset-0 shimmer" />
        </div>
        {percent > 5 && (
          <div
            className="absolute top-0 h-full w-px bg-white/30"
            style={{ left: `${percent}%`, transition: 'left 1s ease-out' }}
          />
        )}
      </div>
      {showLabel && (
        <div className="mt-1 text-right text-xs text-slate-500">{percent.toFixed(1)}%</div>
      )}
    </div>
  )
}
