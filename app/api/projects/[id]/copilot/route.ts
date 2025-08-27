import { getCurrentUser } from '@/auth'
import { assertProjectPermission } from '@/server/guards/acl'
import { handleCopilotSocket } from '@/server/copilot/ws'

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (req.headers.get('upgrade') !== 'websocket') {
    return new Response('Expected websocket', { status: 400 })
  }
  const user = await getCurrentUser()
  const { id } = await params
  await assertProjectPermission(id, user?.id ?? null, 'project:read')
  const pair = (globalThis as any).WebSocketPair ? new (globalThis as any).WebSocketPair() : null
  if (!pair) {
    return new Response('WebSocket not supported', { status: 500 })
  }
  const [client, server] = [pair[0], pair[1]]
  handleCopilotSocket(server, id, user?.id || 'anon')
  return new Response(null, { status: 101, webSocket: client })
}
