import { NextResponse } from 'next/server'

declare global {
  var activeSandbox: any
}

export async function POST(request: Request) {
  try {
    const { sandboxId, path } = await request.json()

    if (!global.activeSandbox) {
      return NextResponse.json({ success: false, error: 'Нет активной песочницы' }, { status: 400 })
    }

    const result = await global.activeSandbox.runCode(`
import json
import os
file_path = os.path.join('/home/user/app', ${JSON.stringify(path)})
try:
    with open(file_path, 'r') as f:
        content = f.read()
    print(json.dumps({'content': content}))
except Exception as e:
    print(json.dumps({'error': str(e)}))
`)
    const output = result.logs.stdout.join('')
    const data = JSON.parse(output)

    if (data.error) {
      return NextResponse.json({ success: false, error: data.error }, { status: 500 })
    }

    return NextResponse.json({ success: true, content: data.content })
  } catch (error) {
    console.error('[files/read] Error:', error)
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 })
  }
}
