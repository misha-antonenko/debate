const BEEP_FREQUENCY_HZ = 1000
const BEEP_GAIN = 0.6

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

  stop(): void {
    if (!this.#oscillator) return
    this.#oscillator.stop()
    this.#oscillator.disconnect()
    this.#oscillator = null
  }
}
