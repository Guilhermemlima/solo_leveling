'use client'
import { useEffect, useRef, useState } from 'react'
import { Music, Play, Pause, Volume2, VolumeX, X, SkipForward } from 'lucide-react'
import { AmbientPlayer } from '@/lib/ambient-audio'

/**
 * Faixas de MP3 opcionais. Coloque seus arquivos em `public/music/` e liste aqui,
 * ex.: { name: 'Minha Faixa', src: '/music/minha-faixa.mp3' }.
 * Se a lista estiver vazia, o player usa a trilha ambiente gerada (sintetizada).
 */
const TRACKS: { name: string; src: string }[] = []

const STORAGE_ON = 'ascend-music-on'
const STORAGE_VOL = 'ascend-music-vol'

export function MusicPlayer() {
  const [open, setOpen] = useState(false)
  const [playing, setPlaying] = useState(false)
  const [volume, setVolume] = useState(0.35)
  const [trackIndex, setTrackIndex] = useState(0)

  const engineRef = useRef<AmbientPlayer | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const usingFiles = TRACKS.length > 0

  // Carrega preferências
  useEffect(() => {
    const savedVol = localStorage.getItem(STORAGE_VOL)
    if (savedVol) setVolume(parseFloat(savedVol))
  }, [])

  // Aplica volume
  useEffect(() => {
    localStorage.setItem(STORAGE_VOL, String(volume))
    if (engineRef.current) engineRef.current.setVolume(volume)
    if (audioRef.current) audioRef.current.volume = volume
  }, [volume])

  const startPlay = async () => {
    if (usingFiles) {
      if (!audioRef.current) {
        const a = new Audio(TRACKS[trackIndex].src)
        a.loop = TRACKS.length === 1
        a.volume = volume
        a.addEventListener('ended', nextTrack)
        audioRef.current = a
      }
      await audioRef.current.play()
    } else {
      if (!engineRef.current) engineRef.current = new AmbientPlayer()
      engineRef.current.setVolume(volume)
      await engineRef.current.start()
    }
    setPlaying(true)
    localStorage.setItem(STORAGE_ON, '1')
  }

  const pausePlay = () => {
    if (usingFiles && audioRef.current) audioRef.current.pause()
    else engineRef.current?.stop()
    setPlaying(false)
    localStorage.setItem(STORAGE_ON, '0')
  }

  const toggle = () => { playing ? pausePlay() : startPlay() }

  const nextTrack = () => {
    if (!usingFiles) return
    const next = (trackIndex + 1) % TRACKS.length
    setTrackIndex(next)
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.src = TRACKS[next].src
      audioRef.current.play().catch(() => {})
    }
  }

  useEffect(() => () => { engineRef.current?.dispose(); audioRef.current?.pause() }, [])

  const trackName = usingFiles ? TRACKS[trackIndex].name : 'Trilha Ambiente'

  return (
    <div className="fixed right-4 bottom-24 lg:bottom-6 z-40">
      {open ? (
        <div className="glass neon-border rounded-2xl p-4 w-64 shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-lg bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center ${playing ? 'animate-pulse' : ''}`}>
                <Music size={15} className="text-indigo-400" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-200">Música</p>
                <p className="text-[10px] text-slate-500">{trackName}</p>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="text-slate-500 hover:text-slate-300"><X size={15} /></button>
          </div>

          {/* Equalizador decorativo */}
          <div className="flex items-end justify-center gap-1 h-8 mb-3">
            {[0, 1, 2, 3, 4, 5, 6].map(i => (
              <span
                key={i}
                className="w-1.5 rounded-full bg-gradient-to-t from-indigo-500 to-purple-400"
                style={{
                  height: playing ? `${30 + Math.abs(Math.sin(i)) * 60}%` : '15%',
                  animation: playing ? `eqbar 0.${6 + i}s ease-in-out infinite alternate` : 'none',
                  opacity: playing ? 1 : 0.3,
                }}
              />
            ))}
          </div>

          <div className="flex items-center gap-2 mb-3">
            <button
              onClick={toggle}
              className="w-10 h-10 rounded-xl bg-indigo-600 hover:bg-indigo-500 flex items-center justify-center text-white shrink-0 transition-colors"
            >
              {playing ? <Pause size={16} /> : <Play size={16} className="ml-0.5" />}
            </button>
            {usingFiles && (
              <button onClick={nextTrack} className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300"><SkipForward size={15} /></button>
            )}
            <div className="flex items-center gap-2 flex-1">
              {volume === 0 ? <VolumeX size={15} className="text-slate-500" /> : <Volume2 size={15} className="text-slate-400" />}
              <input
                type="range" min={0} max={1} step={0.01} value={volume}
                onChange={e => setVolume(parseFloat(e.target.value))}
                className="flex-1 accent-indigo-500 h-1 cursor-pointer"
              />
            </div>
          </div>

          <p className="text-[10px] text-slate-600 text-center">
            {usingFiles ? 'Tocando suas faixas' : 'Trilha original gerada no navegador'}
          </p>
        </div>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className={`w-12 h-12 rounded-full glass neon-border flex items-center justify-center shadow-lg transition-transform hover:scale-105 ${playing ? 'neon-glow' : ''}`}
          aria-label="Abrir player de música"
        >
          <Music size={18} className={playing ? 'text-indigo-300' : 'text-slate-400'} />
          {playing && <span className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-[#0a0a16] animate-pulse" />}
        </button>
      )}
    </div>
  )
}
