import { clockToMs } from "./format.ts"

const STORAGE_KEY = "beep-timer/state/v1"
const DEFAULT_DURATION_MS = clockToMs(1, 0)

export interface StorageLike {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
}

interface Persisted {
  durationMs: number
  remainingMs: number
}

export interface TimerOptions {
  now?: () => number
  storage?: StorageLike
  onComplete?: () => void
}

function loadPersisted(storage: StorageLike): Persisted {
  const raw = storage.getItem(STORAGE_KEY)
  if (raw === null)
    return { durationMs: DEFAULT_DURATION_MS, remainingMs: DEFAULT_DURATION_MS }
  const parsed: unknown = JSON.parse(raw)
  if (
    typeof parsed !== "object" ||
    parsed === null ||
    typeof (parsed as Persisted).durationMs !== "number" ||
    typeof (parsed as Persisted).remainingMs !== "number"
  ) {
    throw new Error(`Corrupt persisted timer state: ${raw}`)
  }
  const { durationMs, remainingMs } = parsed as Persisted
  return { durationMs, remainingMs }
}

export function createTimer(options: TimerOptions = {}) {
  const now = options.now ?? (() => Date.now())
  const storage = options.storage ?? localStorage
  const onComplete = options.onComplete

  const initial = loadPersisted(storage)
  let durationMs = $state(initial.durationMs)
  let remainingMs = $state(initial.remainingMs)
  let isRunning = $state(false)
  let endTimestamp = 0

  function persist(): void {
    storage.setItem(STORAGE_KEY, JSON.stringify({ durationMs, remainingMs }))
  }

  function setDuration(minutes: number, seconds: number): void {
    const ms = clockToMs(minutes, seconds)
    if (ms < 0 || !Number.isFinite(ms))
      throw new Error(`Invalid duration: ${minutes}m ${seconds}s`)
    isRunning = false
    durationMs = ms
    remainingMs = ms
    persist()
  }

  function start(): void {
    if (isRunning || remainingMs <= 0) return
    endTimestamp = now() + remainingMs
    isRunning = true
  }

  function pause(): void {
    if (isRunning) remainingMs = Math.max(0, endTimestamp - now())
    isRunning = false
    persist()
  }

  function tick(): void {
    if (!isRunning) return
    remainingMs = Math.max(0, endTimestamp - now())
    if (remainingMs <= 0) {
      isRunning = false
      persist()
      onComplete?.()
      return
    }
    persist()
  }

  return {
    get durationMs() {
      return durationMs
    },
    get remainingMs() {
      return remainingMs
    },
    get isRunning() {
      return isRunning
    },
    setDuration,
    start,
    pause,
    tick,
  }
}

export type Timer = ReturnType<typeof createTimer>
