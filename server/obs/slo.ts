import { httpDuration, totals } from './metrics'

const TARGETS = {
  uptime: 0.995,
  errorRate: 0.02,
  latencyP95: 2,
}

function getP95() {
  const values = httpDuration.get().values || []
  const buckets = values.filter((v) => v.metricName.endsWith('_bucket'))
  const count = values.find((v) => v.metricName.endsWith('_count'))?.value || 0
  let cum = 0
  for (const b of buckets) {
    cum += b.value
    if (cum / count >= 0.95) return Number(b.labels.le)
  }
  return 0
}

export function getSlo() {
  const uptime = totals.total ? (totals.total - totals.errors) / totals.total : 1
  const errorRate = totals.total ? totals.errors / totals.total : 0
  const latencyP95 = getP95()
  return {
    uptime: { value: uptime, target: TARGETS.uptime, ok: uptime >= TARGETS.uptime },
    errorRate: { value: errorRate, target: TARGETS.errorRate, ok: errorRate <= TARGETS.errorRate },
    latencyP95: {
      value: latencyP95,
      target: TARGETS.latencyP95,
      ok: latencyP95 <= TARGETS.latencyP95,
    },
  }
}
