import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'Ascend System — Transforme sua rotina em uma jornada de evolução'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #050816 0%, #0f0a2e 40%, #1a0533 70%, #050816 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'system-ui, sans-serif',
          position: 'relative',
        }}
      >
        {/* glow orb top-left */}
        <div
          style={{
            position: 'absolute',
            top: -80,
            left: -80,
            width: 400,
            height: 400,
            borderRadius: '50%',
            background: 'rgba(139,92,246,0.15)',
            filter: 'blur(80px)',
          }}
        />
        {/* glow orb bottom-right */}
        <div
          style={{
            position: 'absolute',
            bottom: -80,
            right: -80,
            width: 360,
            height: 360,
            borderRadius: '50%',
            background: 'rgba(6,182,212,0.12)',
            filter: 'blur(80px)',
          }}
        />

        {/* badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            border: '1px solid rgba(6,182,212,0.4)',
            borderRadius: 9999,
            padding: '6px 18px',
            marginBottom: 28,
            background: 'rgba(6,182,212,0.08)',
          }}
        >
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22d3ee' }} />
          <span style={{ color: '#67e8f9', fontSize: 16, fontFamily: 'monospace' }}>
            Pré-venda Fundador — Vagas Limitadas
          </span>
        </div>

        {/* title */}
        <div
          style={{
            fontSize: 72,
            fontWeight: 900,
            color: 'white',
            textAlign: 'center',
            lineHeight: 1.1,
            marginBottom: 20,
            maxWidth: 900,
          }}
        >
          ⚡ Ascend System
        </div>

        {/* subtitle */}
        <div
          style={{
            fontSize: 28,
            color: '#a78bfa',
            textAlign: 'center',
            maxWidth: 780,
            lineHeight: 1.4,
            marginBottom: 36,
          }}
        >
          Transforme sua rotina em uma jornada de evolução
        </div>

        {/* features row */}
        <div style={{ display: 'flex', gap: 20 }}>
          {['⚔️ Missões', '📈 EXP & Ranks', '🎒 Inventário', '🛡️ 7 dias de garantia'].map((f) => (
            <div
              key={f}
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 12,
                padding: '8px 16px',
                color: '#94a3b8',
                fontSize: 16,
              }}
            >
              {f}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size },
  )
}
