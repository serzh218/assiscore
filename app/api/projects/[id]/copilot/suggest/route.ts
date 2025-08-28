import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/auth'
import { assertProjectPermission } from '@/server/guards/acl'
import { logCopilotEvent } from '@/server/repo/copilot'

interface SuggestBody {
  filePath: string
  content: string
  cursorLine: number
  cursorColumn: number
  prefix: string
  suffix: string
  imports?: string[]
  files?: string[]
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    await assertProjectPermission(id, user.id, 'project:read')

    const body: SuggestBody = await req.json()

    let suggestions: Array<{ text: string; kind: string }>
    if (process.env.NODE_ENV === 'production') {
      try {
        const res = await fetch(process.env.COPILOT_LLM_URL || '', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })
        const data = await res.json()
        suggestions = data.suggestions || []
      } catch {
        suggestions = []
      }
    } else {
      suggestions = [{ text: "console.log('Hello CoPilot!')", kind: 'inline' }]
    }

    if (suggestions[0]) {
      await logCopilotEvent({
        userId: user.id,
        projectId: id,
        filePath: body.filePath,
        action: 'suggested',
        text: suggestions[0].text,
      })
    }

    return NextResponse.json({ suggestions })
  } catch (err) {
    console.error('[copilot/suggest]', err)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
