const BEEP_FREQUENCY_HZ = 1000
const BEEP_GAIN = 0.6

const CHIME_HZ = [659.25, 783.99, 987.77, 1318.51] as const
const CHIME_LEAD_S = 0.03
const CHIME_STEP_S = 0.16
const CHIME_DECAY_S = 1.1
const CHIME_GAIN = 0.3
const SILENCE_GAIN = 0.0001

export class Beeper {
  #context: AudioContext | null = null
  #oscillator: OscillatorNode | null = null

  start(): void {
    if (this.#oscillator) return
    this.#context ??= new AudioContext()
    void this.#context.resume()

    const oscillator = this.#context.createOscillator()
    const gain = this.#context.createGain()
    oscillator.type = "square"
    oscillator.frequency.value = BEEP_FREQUENCY_HZ
    gain.gain.value = BEEP_GAIN
    oscillator.connect(gain).connect(this.#context.destination)
    oscillator.start()
    this.#oscillator = oscillator
  }

  chime(): void {
    const context = (this.#context ??= new AudioContext())
    void context.resume()
    const start = context.currentTime + CHIME_LEAD_S

    CHIME_HZ.forEach((frequencyHz, index) => {
      const at = start + index * CHIME_STEP_S
      const end = at + CHIME_DECAY_S

      const gain = context.createGain()
      gain.gain.setValueAtTime(0, at)
      gain.gain.linearRampToValueAtTime(CHIME_GAIN, at + ATTACK_S)
      gain.gain.exponentialRampToValueAtTime(SILENCE_GAIN, end)
      gain.connect(context.destination)

      const oscillator = context.createOscillator()
      oscillator.type = "triangle"
      oscillator.frequency.value = frequencyHz
      oscillator.connect(gain)
      oscillator.start(at)
      oscillator.stop(end)
    })
  }

  stop(): void {
    if (!this.#oscillator) return
    this.#oscillator.stop()
    this.#oscillator.disconnect()
    this.#oscillator = null
  }
}
