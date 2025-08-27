export const QUALITY = {
  coverage: {
    global: { lines: 70, statements: 70, branches: 60, functions: 65 },
    perFile: 50,
  },
  bundle: {
    maxKbDelta: 150,
  },
  aiCost: {
    warnTokensDelta: 2000,
  },
} as const

export type QualityConfig = typeof QUALITY
