import { describe, it, expect, beforeEach } from "vitest"
import { createTimer, type StorageLike } from "../timer.svelte.ts"

class MemoryStorage implements StorageLike {
  #map = new Map<string, string>()
  getItem(key: string): string | null {
    return this.#map.get(key) ?? null
  }
  setItem(key: string, value: string): void {
    this.#map.set(key, value)
  }
}

let clock = 0
const now = () => clock

beforeEach(() => {
  clock = 0
})

describe("createTimer", () => {
  it("defaults to a persisted 1-minute duration", () => {
    const timer = createTimer({ now, storage: new MemoryStorage() })
    expect(timer.remainingMs).toBe(60_000)
    expect(timer.isRunning).toBe(false)
  })

  it("setDuration resets remaining and pauses", () => {
    const timer = createTimer({ now, storage: new MemoryStorage() })
    timer.setDuration(2, 30)
    expect(timer.durationMs).toBe(150_000)
    expect(timer.remainingMs).toBe(150_000)
    expect(timer.isRunning).toBe(false)
  })

  it("counts down while running", () => {
    const timer = createTimer({ now, storage: new MemoryStorage() })
    timer.setDuration(0, 10)
    timer.start()
    expect(timer.isRunning).toBe(true)
    clock = 4_000
    timer.tick()
    expect(timer.remainingMs).toBe(6_000)
  })

  it("pause freezes the remaining time by wall clock", () => {
    const timer = createTimer({ now, storage: new MemoryStorage() })
    timer.setDuration(0, 10)
    timer.start()
    clock = 3_500
    timer.pause()
    expect(timer.isRunning).toBe(false)
    expect(timer.remainingMs).toBe(6_500)
    clock = 9_000
    expect(timer.remainingMs).toBe(6_500)
  })

  it("resume continues from the paused remaining", () => {
    const timer = createTimer({ now, storage: new MemoryStorage() })
    timer.setDuration(0, 10)
    timer.start()
    clock = 3_000
    timer.pause()
    clock = 100_000
    timer.start()
    clock = 102_000
    timer.tick()
    expect(timer.remainingMs).toBe(5_000)
  })

  it("auto-pauses at zero and does not go negative", () => {
    const timer = createTimer({ now, storage: new MemoryStorage() })
    timer.setDuration(0, 5)
    timer.start()
    clock = 9_000
    timer.tick()
    expect(timer.remainingMs).toBe(0)
    expect(timer.isRunning).toBe(false)
  })

  it("start is a no-op at zero remaining", () => {
    const timer = createTimer({ now, storage: new MemoryStorage() })
    timer.setDuration(0, 0)
    timer.start()
    expect(timer.isRunning).toBe(false)
  })

  it("persists remaining across reloads but always loads paused", () => {
    const storage = new MemoryStorage()
    const first = createTimer({ now, storage })
    first.setDuration(0, 20)
    first.start()
    clock = 5_000
    first.tick()
    expect(first.remainingMs).toBe(15_000)

    clock = 999_999
    const reloaded = createTimer({ now, storage })
    expect(reloaded.remainingMs).toBe(15_000)
    expect(reloaded.isRunning).toBe(false)
  })

  it("throws on corrupt persisted state", () => {
    const storage = new MemoryStorage()
    storage.setItem("beep-timer/state/v1", '{"durationMs":"nope"}')
    expect(() => createTimer({ now, storage })).toThrow(/Corrupt/)
  })
})
