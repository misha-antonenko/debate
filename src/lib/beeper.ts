const CHORD_HZ = [523.25, 659.25, 783.99] as const
const MASTER_GAIN = 0.22
const ATTACK_S = 0.04
const RELEASE_S = 0.15
const TREMOLO_HZ = 5
const TREMOLO_DEPTH = 0.12

export class Beeper {
  #context: AudioContext | null = null
  #voices: OscillatorNode[] = []
  #master: GainNode | null = null

  start(): void {
    if (this.#voices.length) return
    const context = (this.#context ??= new AudioContext())
    void context.resume()
    const now = context.currentTime

    const master = context.createGain()
    master.gain.setValueAtTime(0, now)
    master.gain.linearRampToValueAtTime(MASTER_GAIN, now + ATTACK_S)
    master.connect(context.destination)

    const tremolo = context.createOscillator()
    const tremoloDepth = context.createGain()
    tremolo.frequency.value = TREMOLO_HZ
    tremoloDepth.gain.value = TREMOLO_DEPTH * MASTER_GAIN
    tremolo.connect(tremoloDepth).connect(master.gain)
    tremolo.start(now)

    const voices = CHORD_HZ.map((frequencyHz) => {
      const oscillator = context.createOscillator()
      oscillator.type = "sine"
      oscillator.frequency.value = frequencyHz
      oscillator.connect(master)
      oscillator.start(now)
      return oscillator
    })

    this.#master = master
    this.#voices = [...voices, tremolo]
  }

  stop(): void {
    if (!this.#voices.length || !this.#context || !this.#master) return
    const now = this.#context.currentTime
    this.#master.gain.cancelScheduledValues(now)
    this.#master.gain.setValueAtTime(this.#master.gain.value, now)
    this.#master.gain.linearRampToValueAtTime(0, now + RELEASE_S)
    for (const voice of this.#voices) voice.stop(now + RELEASE_S)
    this.#voices = []
    this.#master = null
  }
}
