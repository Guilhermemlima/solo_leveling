/**
 * Trilha sonora ambiente gerada proceduralmente com a Web Audio API.
 * Original (sem direitos autorais), funciona offline e combina com o tema
 * "futurista de RPG": um pad calmo com arpejo e reverb, evoluindo entre acordes.
 *
 * Uso:
 *   const player = new AmbientPlayer()
 *   await player.start()   // precisa ser chamado após um clique do usuário
 *   player.setVolume(0.4)
 *   player.stop()
 */

const midiToFreq = (m: number) => 440 * Math.pow(2, (m - 69) / 12)

// Progressão calma em Lá menor: Am – F – C – G (acordes como tríades MIDI)
const CHORDS: number[][] = [
  [57, 60, 64], // Am
  [53, 57, 60], // F
  [48, 52, 55], // C
  [55, 59, 62], // G
]

// Notas para o arpejo (pentatônica de Lá menor) por oitava
const ARP_SCALE = [57, 60, 62, 64, 67, 69, 72]

export class AmbientPlayer {
  private ctx: AudioContext | null = null
  private master: GainNode | null = null
  private bus: GainNode | null = null
  private reverbGain: GainNode | null = null
  private timer: ReturnType<typeof setInterval> | null = null

  private playing = false
  private volume = 0.35

  private nextNoteTime = 0
  private step = 0
  private chordIndex = 0

  private readonly noteLen = 0.42 // segundos por passo do arpejo
  private readonly stepsPerChord = 16
  private readonly lookahead = 0.12

  get isPlaying() { return this.playing }

  async start() {
    if (this.playing) return
    if (!this.ctx) this.setup()
    if (this.ctx!.state === 'suspended') await this.ctx!.resume()

    this.playing = true
    this.nextNoteTime = this.ctx!.currentTime + 0.1
    this.step = 0
    this.chordIndex = 0
    // fade in
    this.master!.gain.cancelScheduledValues(this.ctx!.currentTime)
    this.master!.gain.setValueAtTime(0.0001, this.ctx!.currentTime)
    this.master!.gain.exponentialRampToValueAtTime(Math.max(0.0002, this.volume), this.ctx!.currentTime + 2)

    this.spawnPad(this.chordIndex, this.nextNoteTime)
    this.timer = setInterval(() => this.scheduler(), 25)
  }

  stop() {
    if (!this.playing || !this.ctx || !this.master) { this.playing = false; return }
    const now = this.ctx.currentTime
    this.master.gain.cancelScheduledValues(now)
    this.master.gain.setValueAtTime(this.master.gain.value, now)
    this.master.gain.exponentialRampToValueAtTime(0.0001, now + 1.2)
    this.playing = false
    if (this.timer) { clearInterval(this.timer); this.timer = null }
  }

  setVolume(v: number) {
    this.volume = Math.max(0, Math.min(1, v))
    if (this.ctx && this.master && this.playing) {
      this.master.gain.cancelScheduledValues(this.ctx.currentTime)
      this.master.gain.setTargetAtTime(Math.max(0.0002, this.volume), this.ctx.currentTime, 0.1)
    }
  }

  getVolume() { return this.volume }

  // ---- interno ----

  private setup() {
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    this.ctx = new Ctx()

    this.master = this.ctx.createGain()
    this.master.gain.value = 0.0001

    const comp = this.ctx.createDynamicsCompressor()
    this.master.connect(comp)
    comp.connect(this.ctx.destination)

    // barramento de voz (dry + envio pra reverb)
    this.bus = this.ctx.createGain()
    this.bus.gain.value = 1
    this.bus.connect(this.master)

    const convolver = this.ctx.createConvolver()
    convolver.buffer = this.makeImpulse(2.8, 2.2)
    this.reverbGain = this.ctx.createGain()
    this.reverbGain.gain.value = 0.5
    this.bus.connect(convolver)
    convolver.connect(this.reverbGain)
    this.reverbGain.connect(this.master)
  }

  private makeImpulse(seconds: number, decay: number): AudioBuffer {
    const rate = this.ctx!.sampleRate
    const len = Math.floor(rate * seconds)
    const buf = this.ctx!.createBuffer(2, len, rate)
    for (let ch = 0; ch < 2; ch++) {
      const data = buf.getChannelData(ch)
      for (let i = 0; i < len; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay)
      }
    }
    return buf
  }

  private scheduler() {
    if (!this.ctx || !this.playing) return
    while (this.nextNoteTime < this.ctx.currentTime + this.lookahead) {
      this.playStep(this.step, this.nextNoteTime)
      this.nextNoteTime += this.noteLen
      this.step++
      if (this.step % this.stepsPerChord === 0) {
        this.chordIndex = (this.chordIndex + 1) % CHORDS.length
        this.spawnPad(this.chordIndex, this.nextNoteTime)
      }
    }
  }

  private playStep(step: number, time: number) {
    // arpejo: nem todo passo toca nota (deixa respiração)
    const pattern = [0, 2, 4, 2, 1, 3, 5, 3]
    const local = step % pattern.length
    if (step % 2 === 1 && Math.random() < 0.35) return // alguns silêncios

    const idx = pattern[local] % ARP_SCALE.length
    const octave = step % 32 < 16 ? 0 : 12
    const midi = ARP_SCALE[idx] + octave
    this.pluck(midiToFreq(midi), time)
  }

  /** Nota curta e cristalina do arpejo. */
  private pluck(freq: number, time: number) {
    if (!this.ctx || !this.bus) return
    const osc = this.ctx.createOscillator()
    const gain = this.ctx.createGain()
    const filter = this.ctx.createBiquadFilter()

    osc.type = 'triangle'
    osc.frequency.value = freq
    filter.type = 'lowpass'
    filter.frequency.value = 2200
    filter.Q.value = 1

    const peak = 0.12
    gain.gain.setValueAtTime(0.0001, time)
    gain.gain.exponentialRampToValueAtTime(peak, time + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 1.1)

    osc.connect(filter)
    filter.connect(gain)
    gain.connect(this.bus)
    osc.start(time)
    osc.stop(time + 1.2)
  }

  /** Acorde sustentado (pad) com vozes levemente desafinadas. */
  private spawnPad(chordIndex: number, time: number) {
    if (!this.ctx || !this.bus) return
    const chord = CHORDS[chordIndex]
    const dur = this.noteLen * this.stepsPerChord

    for (const midi of chord) {
      for (const detune of [-6, 6]) {
        const osc = this.ctx.createOscillator()
        const gain = this.ctx.createGain()
        const filter = this.ctx.createBiquadFilter()

        osc.type = 'sawtooth'
        osc.frequency.value = midiToFreq(midi - 12) // uma oitava abaixo, mais grave/quente
        osc.detune.value = detune

        filter.type = 'lowpass'
        filter.frequency.value = 700
        filter.Q.value = 0.7

        const peak = 0.05
        gain.gain.setValueAtTime(0.0001, time)
        gain.gain.exponentialRampToValueAtTime(peak, time + 1.5) // ataque lento
        gain.gain.setValueAtTime(peak, time + dur - 1.5)
        gain.gain.exponentialRampToValueAtTime(0.0001, time + dur) // release

        osc.connect(filter)
        filter.connect(gain)
        gain.connect(this.bus)
        osc.start(time)
        osc.stop(time + dur + 0.1)
      }
    }
  }

  dispose() {
    this.stop()
    if (this.ctx) { this.ctx.close().catch(() => {}); this.ctx = null }
  }
}
