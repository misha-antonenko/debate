import { describe, it, expect } from "vitest"
import { msToClock, clockToMs } from "../format.ts"

describe("msToClock", () => {
  it("formats whole minutes and seconds", () => {
    expect(msToClock(90_000)).toBe("01:30")
  })

  it("rounds partial seconds up so a live timer never shows 00:00 early", () => {
    expect(msToClock(1)).toBe("00:01")
    expect(msToClock(1_001)).toBe("00:02")
  })

  it("clamps negatives to zero", () => {
    expect(msToClock(-5)).toBe("00:00")
    expect(msToClock(0)).toBe("00:00")
  })
})

describe("clockToMs", () => {
  it("is the inverse of the minute/second split", () => {
    expect(clockToMs(2, 5)).toBe(125_000)
  })
})
