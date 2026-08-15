const MS_PER_SECOND = 1000
const SECONDS_PER_MINUTE = 60

export function msToClock(ms: number): string {
  const totalSeconds = Math.ceil(Math.max(0, ms) / MS_PER_SECOND)
  const minutes = Math.floor(totalSeconds / SECONDS_PER_MINUTE)
  const seconds = totalSeconds % SECONDS_PER_MINUTE
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${pad(minutes)}:${pad(seconds)}`
}

export function clockToMs(minutes: number, seconds: number): number {
  return (minutes * SECONDS_PER_MINUTE + seconds) * MS_PER_SECOND
}
