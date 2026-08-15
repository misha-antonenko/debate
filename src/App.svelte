<script lang="ts">
  import { createTimer } from "./lib/timer.svelte.ts"
  import { Beeper } from "./lib/beeper.ts"
  import { msToClock } from "./lib/format.ts"

  const TICK_MS = 100
  const MS_PER_SECOND = 1000
  const SECONDS_PER_MINUTE = 60

  const timer = createTimer()
  const beeper = new Beeper()

  let minutesInput = $state(
    Math.floor(timer.durationMs / MS_PER_SECOND / SECONDS_PER_MINUTE),
  )
  let secondsInput = $state(
    Math.floor(timer.durationMs / MS_PER_SECOND) % SECONDS_PER_MINUTE,
  )

  $effect(() => {
    if (!timer.isRunning) return
    const handle = setInterval(() => timer.tick(), TICK_MS)
    return () => clearInterval(handle)
  })

  function applyDuration(): void {
    timer.setDuration(minutesInput, secondsInput)
  }

  function pressStop(): void {
    timer.pause()
    beeper.start()
  }

  function releaseStop(): void {
    beeper.stop()
  }
</script>

<svelte:window onblur={releaseStop} />

<main class="flex min-h-screen flex-col items-center justify-between gap-8 p-6">
  <section class="flex w-full max-w-sm flex-col items-center gap-4 pt-6">
    <div class="font-mono text-7xl tabular-nums" data-testid="clock">
      {msToClock(timer.remainingMs)}
    </div>

    <div class="flex items-center gap-2">
      <input
        type="number"
        min="0"
        bind:value={minutesInput}
        aria-label="minutes"
        class="w-20 rounded bg-stone-800 p-2 text-center font-mono text-2xl"
      />
      <span class="text-2xl">:</span>
      <input
        type="number"
        min="0"
        max="59"
        bind:value={secondsInput}
        aria-label="seconds"
        class="w-20 rounded bg-stone-800 p-2 text-center font-mono text-2xl"
      />
      <button
        onclick={applyDuration}
        class="rounded bg-stone-700 px-4 py-2 text-lg font-semibold active:bg-stone-600"
      >
        Set
      </button>
    </div>
  </section>

  <section class="flex w-full max-w-sm flex-col gap-6 pb-10">
    <button
      data-testid="stop"
      onpointerdown={pressStop}
      onpointerup={releaseStop}
      onpointerleave={releaseStop}
      onpointercancel={releaseStop}
      oncontextmenu={(event) => event.preventDefault()}
      class="h-40 w-full touch-none rounded-3xl bg-red-600 text-3xl font-bold text-white shadow-lg select-none active:bg-red-500"
    >
      HOLD TO STOP + BEEP
    </button>

    <button
      data-testid="resume"
      onclick={() => timer.start()}
      class="h-40 w-full rounded-3xl bg-blue-600 text-3xl font-bold text-white shadow-lg select-none active:bg-blue-500"
    >
      RESUME
    </button>
  </section>
</main>
