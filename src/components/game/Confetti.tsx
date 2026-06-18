'use client'
import { useEffect, useState } from 'react'

interface Piece {
  id: number
  left: number
  delay: number
  duration: number
  color: string
  size: number
  rotate: number
}

const COLORS = ['#6366f1', '#8b5cf6', '#f59e0b', '#10b981', '#ec4899', '#fbbf24']

/** Confete leve em CSS puro, sem dependências. Renderiza por ~2.5s. */
export function Confetti({ count = 80 }: { count?: number }) {
  const [pieces, setPieces] = useState<Piece[]>([])

  useEffect(() => {
    setPieces(
      Array.from({ length: count }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 0.4,
        duration: 1.8 + Math.random() * 1.4,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        size: 6 + Math.random() * 6,
        rotate: Math.random() * 360,
      }))
    )
  }, [count])

  return (
    <div className="pointer-events-none fixed inset-0 z-[60] overflow-hidden">
      {pieces.map(p => (
        <span
          key={p.id}
          className="confetti-piece absolute top-[-20px]"
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.size * 0.6,
            background: p.color,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            transform: `rotate(${p.rotate}deg)`,
          }}
        />
      ))}
    </div>
  )
}
