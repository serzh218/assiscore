import { getCycleData } from '@/server/tests/orchestrator'

export async function GET(req: Request) {
  const url = new URL(req.url)
  const cycleId = url.searchParams.get('cycleId')
  const cycle = cycleId ? getCycleData(cycleId) : undefined
  if (!cycle) {
    return new Response(JSON.stringify({ status: 'not_found' }), { status: 404 })
  }
  return new Response(
    JSON.stringify({
      status: 'running',
      lastRun: { report: cycle.lastReport, logs: cycle.lastLogs },
    }),
    { headers: { 'content-type': 'application/json' } },
  )
}
