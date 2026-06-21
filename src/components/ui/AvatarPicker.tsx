'use client'
import { useRef, useState } from 'react'
import { Upload, Check, X } from 'lucide-react'

// 20 predefined RPG avatars — emoji + gradient palette
export const PRESET_AVATARS = [
  { id: 'shadow-monarch', emoji: '👑', label: 'Monarca das Sombras', bg: ['#1a0533', '#4c0099'], accent: '#a855f7' },
  { id: 'shadow-hunter', emoji: '🗡️', label: 'Caçador das Sombras', bg: ['#0f172a', '#1e3a5f'], accent: '#3b82f6' },
  { id: 'mage', emoji: '🔮', label: 'Mago Arcano', bg: ['#0d1b2a', '#1a3a4a'], accent: '#06b6d4' },
  { id: 'berserker', emoji: '⚔️', label: 'Berserker', bg: ['#2d0000', '#7f1d1d'], accent: '#ef4444' },
  { id: 'assassin', emoji: '🥷', label: 'Assassino', bg: ['#0a0a0a', '#1c1c1c'], accent: '#6b7280' },
  { id: 'archer', emoji: '🏹', label: 'Arqueiro', bg: ['#0f2810', '#145214'], accent: '#22c55e' },
  { id: 'paladin', emoji: '🛡️', label: 'Paladino', bg: ['#1c1400', '#3d2e00'], accent: '#fbbf24' },
  { id: 'necromancer', emoji: '💀', label: 'Necromante', bg: ['#0d0d0d', '#1a0a1a'], accent: '#c084fc' },
  { id: 'dragon', emoji: '🐉', label: 'Senhor dos Dragões', bg: ['#1a0a00', '#3d1500'], accent: '#f97316' },
  { id: 'healer', emoji: '✨', label: 'Curandeiro Sagrado', bg: ['#001a1a', '#003333'], accent: '#2dd4bf' },
  { id: 'wolf', emoji: '🐺', label: 'Caçador do Lobo', bg: ['#111827', '#1f2937'], accent: '#9ca3af' },
  { id: 'phoenix', emoji: '🔥', label: 'Fênix Renascida', bg: ['#1c0500', '#4a1500'], accent: '#fb923c' },
  { id: 'void', emoji: '🌑', label: 'Andarilho do Vazio', bg: ['#000005', '#05001a'], accent: '#818cf8' },
  { id: 'rune', emoji: '📖', label: 'Estudioso de Runas', bg: ['#0a0a1a', '#1a1a2e'], accent: '#60a5fa' },
  { id: 'spirit', emoji: '👻', label: 'Espírito Etéreo', bg: ['#0a0f0a', '#1a2a1a'], accent: '#86efac' },
  { id: 'thunder', emoji: '⚡', label: 'Senhor do Trovão', bg: ['#0a0a1a', '#1a1a00'], accent: '#facc15' },
  { id: 'blood', emoji: '🩸', label: 'Guerreiro de Sangue', bg: ['#1a0000', '#2d0000'], accent: '#dc2626' },
  { id: 'star', emoji: '🌟', label: 'Observador Estelar', bg: ['#00001a', '#001033'], accent: '#a5b4fc' },
  { id: 'iron', emoji: '⚙️', label: 'Forjador de Ferro', bg: ['#0f0f0f', '#1a1a1a'], accent: '#78716c' },
  { id: 'crystal', emoji: '💎', label: 'Guardião de Cristal', bg: ['#001a1a', '#002233'], accent: '#67e8f9' },
]

// Generate avatar as canvas PNG (emoji over gradient background)
async function renderPresetToDataUrl(preset: typeof PRESET_AVATARS[0]): Promise<string> {
  return new Promise(resolve => {
    const size = 200
    const canvas = document.createElement('canvas')
    canvas.width = size
    canvas.height = size
    const ctx = canvas.getContext('2d')!

    // Gradient background
    const grad = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
    grad.addColorStop(0, preset.bg[1])
    grad.addColorStop(1, preset.bg[0])
    ctx.fillStyle = grad
    ctx.beginPath()
    ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2)
    ctx.fill()

    // Subtle border glow
    ctx.strokeStyle = preset.accent
    ctx.lineWidth = 4
    ctx.globalAlpha = 0.5
    ctx.beginPath()
    ctx.arc(size / 2, size / 2, size / 2 - 3, 0, Math.PI * 2)
    ctx.stroke()
    ctx.globalAlpha = 1

    // Emoji
    ctx.font = `${size * 0.46}px serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(preset.emoji, size / 2, size / 2 + 4)

    resolve(canvas.toDataURL('image/png'))
  })
}

// Compress uploaded image to 200x200 JPEG
async function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = e => {
      const img = new Image()
      img.onload = () => {
        const size = 200
        const canvas = document.createElement('canvas')
        canvas.width = size
        canvas.height = size
        const ctx = canvas.getContext('2d')!

        // Cover crop (center)
        const scale = Math.max(size / img.width, size / img.height)
        const sw = size / scale
        const sh = size / scale
        const sx = (img.width - sw) / 2
        const sy = (img.height - sh) / 2
        ctx.drawImage(img, sx, sy, sw, sh, 0, 0, size, size)

        resolve(canvas.toDataURL('image/jpeg', 0.82))
      }
      img.onerror = reject
      img.src = e.target?.result as string
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

interface AvatarPickerProps {
  current: string
  onSelect: (dataUrl: string) => void
  onClose: () => void
}

export function AvatarPicker({ current, onSelect, onClose }: AvatarPickerProps) {
  const [tab, setTab] = useState<'gallery' | 'upload'>('gallery')
  const [selected, setSelected] = useState<string>(current)
  const [uploading, setUploading] = useState(false)
  const [applying, setApplying] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const pickPreset = async (preset: typeof PRESET_AVATARS[0]) => {
    const url = await renderPresetToDataUrl(preset)
    setSelected(url)
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const compressed = await compressImage(file)
      setSelected(compressed)
      setTab('gallery') // show preview in same area
    } catch {
      // ignore
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  const apply = async () => {
    setApplying(true)
    await onSelect(selected)
    setApplying(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}>
      <div className="glass border border-purple-500/30 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl" style={{ boxShadow: '0 0 60px rgba(139,92,246,0.25)' }}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-700/50">
          <div>
            <h2 className="font-bold text-white text-lg">Escolher Avatar</h2>
            <p className="text-xs text-slate-500 mt-0.5">Galeria de avatares ou foto do dispositivo</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-700/50 transition-all">
            <X size={20} />
          </button>
        </div>

        {/* Preview + tabs */}
        <div className="px-6 pt-5 flex items-center gap-5">
          {/* Current selected preview */}
          <div className="relative shrink-0">
            {selected ? (
              <img src={selected} alt="Avatar" className="w-20 h-20 rounded-full object-cover border-2 border-purple-500/60" style={{ boxShadow: '0 0 20px rgba(139,92,246,0.4)' }} />
            ) : (
              <div className="w-20 h-20 rounded-full border-2 border-dashed border-slate-600 flex items-center justify-center text-3xl bg-slate-800/50">
                👤
              </div>
            )}
            {selected && <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center"><Check size={12} /></div>}
          </div>

          {/* Tabs */}
          <div className="flex gap-2">
            <button onClick={() => setTab('gallery')} className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${tab === 'gallery' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-700/50'}`}>
              Galeria
            </button>
            <button onClick={() => setTab('upload')} className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-1.5 ${tab === 'upload' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-700/50'}`}>
              <Upload size={13} /> Biblioteca
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-4" style={{ maxHeight: '340px', overflowY: 'auto' }}>
          {tab === 'gallery' ? (
            <div className="grid grid-cols-5 gap-2.5">
              {PRESET_AVATARS.map(preset => (
                <button
                  key={preset.id}
                  title={preset.label}
                  onClick={() => pickPreset(preset)}
                  className="flex flex-col items-center gap-1.5 group"
                >
                  <div
                    className="w-14 h-14 rounded-full flex items-center justify-center text-2xl transition-all group-hover:scale-110 border-2"
                    style={{
                      background: `radial-gradient(circle at 40% 40%, ${preset.bg[1]}, ${preset.bg[0]})`,
                      borderColor: `${preset.accent}60`,
                      boxShadow: `0 0 12px ${preset.accent}30`,
                    }}
                  >
                    {preset.emoji}
                  </div>
                  <span className="text-[9px] text-slate-500 text-center leading-tight line-clamp-2 w-full">{preset.label}</span>
                </button>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 gap-4">
              <div
                className="w-32 h-32 rounded-full border-2 border-dashed border-purple-500/40 flex flex-col items-center justify-center cursor-pointer hover:border-purple-400 hover:bg-purple-500/5 transition-all"
                onClick={() => fileRef.current?.click()}
              >
                {uploading ? (
                  <div className="w-6 h-6 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Upload size={28} className="text-purple-400 mb-2" />
                    <span className="text-xs text-slate-400 text-center leading-tight px-2">Toque para escolher</span>
                  </>
                )}
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-white">Foto da biblioteca</p>
                <p className="text-xs text-slate-500 mt-0.5">JPG, PNG ou WEBP · Será recortada em 200×200px</p>
              </div>
              <button
                onClick={() => fileRef.current?.click()}
                className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-sm font-semibold transition-all flex items-center gap-2"
              >
                <Upload size={14} /> Selecionar foto
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleUpload}
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-slate-700/50 bg-slate-900/30">
          <button onClick={onClose} className="px-4 py-2 rounded-xl text-sm text-slate-400 hover:text-white hover:bg-slate-700/50 transition-all">
            Cancelar
          </button>
          <button
            onClick={apply}
            disabled={!selected || applying}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-bold transition-all"
            style={{ boxShadow: '0 0 20px rgba(139,92,246,0.4)' }}
          >
            {applying ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Check size={15} />}
            Aplicar avatar
          </button>
        </div>
      </div>
    </div>
  )
}
