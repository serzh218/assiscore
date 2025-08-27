import { runTestFirstCycle } from '@/server/tests/orchestrator'

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json()
  const { targetPath, selection, prompt } = body
  const result = await runTestFirstCycle({
    projectId: params.id,
    userId: 'user',
    targetPath,
    selection,
    prompt,
  })
  return new Response(JSON.stringify(result), { headers: { 'content-type': 'application/json' } })
}
