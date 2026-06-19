'use client'
import { useEffect, useRef, useState } from 'react'
import { Music, Pause, Play, SkipForward, Volume2, VolumeX, X } from 'lucide-react'

const TRACKS = [
  { name: 'Epic Cinematic · Watermello', src: '/music/watermello-epic-cinematic-477135.mp3' },
  { name: 'Epic Cinematic · Apalonbeats', src: '/music/apalonbeats-epic-cinematic-epic-529530.mp3' },
  { name: 'Epic Cinematic · Nastelbom', src: '/music/nastelbom-epic-cinematic-453509.mp3' },
]

const STORAGE_VOL = 'ascend-music-vol'

export function MusicPlayer() {
  const [open, setOpen] = useState(false)
  const [playing, setPlaying] = useState(false)
  const [volume, setVolume] = useState(0.25)
  const [trackIndex, setTrackIndex] = useState(0)
  const indexRef = useRef(0)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const playAt = async (index: number) => {
    const normalized = (index + TRACKS.length) % TRACKS.length
    indexRef.current = normalized
    setTrackIndex(normalized)
    if (!audioRef.current) {
      audioRef.current = new Audio()
      audioRef.current.preload = 'metadata'
      audioRef.current.onended = () => void playAt(indexRef.current + 1)
    }
    audioRef.current.src = TRACKS[normalized].src
    audioRef.current.volume = volume
    await audioRef.current.play()
    setPlaying(true)
  }

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_VOL)
    if (saved) setVolume(Number(saved))
    return () => audioRef.current?.pause()
  }, [])

  useEffect(() => {
    localStorage.setItem(STORAGE_VOL, String(volume))
    if (audioRef.current) audioRef.current.volume = volume
  }, [volume])

  const toggle = async () => {
    if (playing) {
      audioRef.current?.pause()
      setPlaying(false)
    } else if (audioRef.current?.src) {
      await audioRef.current.play()
      setPlaying(true)
    } else {
      await playAt(trackIndex)
    }
  }

  return <div className="fixed right-4 bottom-24 lg:bottom-6 z-40">
    {open ? <div className="glass neon-border rounded-2xl p-4 w-72 shadow-xl">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2"><div className={`w-9 h-9 rounded-lg bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center ${playing ? 'animate-pulse' : ''}`}><Music size={16} className="text-indigo-400" /></div>
          <div className="min-w-0"><p className="text-xs font-semibold text-slate-200">Trilha cinematográfica</p><p className="text-[10px] text-slate-500 truncate">{TRACKS[trackIndex].name}</p></div></div>
        <button onClick={() => setOpen(false)} className="text-slate-500 hover:text-slate-300"><X size={15} /></button>
      </div>
      <div className="flex items-end justify-center gap-1 h-8 mb-3">{[0,1,2,3,4,5,6].map(index => <span key={index} className="w-1.5 rounded-full bg-gradient-to-t from-indigo-500 to-purple-400" style={{ height: playing ? `${30 + Math.abs(Math.sin(index)) * 60}%` : '15%', animation: playing ? `eqbar 0.${6 + index}s ease-in-out infinite alternate` : 'none', opacity: playing ? 1 : .3 }} />)}</div>
      <div className="flex items-center gap-2">
        <button onClick={() => void toggle()} className="w-10 h-10 rounded-xl bg-indigo-600 hover:bg-indigo-500 flex items-center justify-center text-white">{playing ? <Pause size={16} /> : <Play size={16} />}</button>
        <button onClick={() => void playAt(trackIndex + 1)} className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300"><SkipForward size={15} /></button>
        {volume === 0 ? <VolumeX size={15} className="text-slate-500" /> : <Volume2 size={15} className="text-slate-400" />}
        <input className="flex-1 accent-indigo-500" type="range" min={0} max={1} step={0.01} value={volume} onChange={event => setVolume(Number(event.target.value))} />
      </div>
      <p className="text-[10px] text-slate-600 text-center mt-3">3 faixas em reprodução contínua</p>
    </div> : <button onClick={() => setOpen(true)} aria-label="Abrir player de música" className={`relative w-12 h-12 rounded-full glass neon-border flex items-center justify-center shadow-lg hover:scale-105 ${playing ? 'neon-glow' : ''}`}><Music size={18} className={playing ? 'text-indigo-300' : 'text-slate-400'} />{playing && <span className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-[#0a0a16] animate-pulse" />}</button>}
  </div>
}
