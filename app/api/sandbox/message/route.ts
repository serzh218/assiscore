import { NextRequest, NextResponse } from 'next/server';
import { Sandbox } from '@e2b/code-interpreter';

export async function POST(request: NextRequest) {
  try {
    const { sandboxId, message } = await request.json();

    const sandbox = await (Sandbox as any).reconnect(
      sandboxId,
      { apiKey: process.env.E2B_API_KEY }
    );

    const processesModule = (sandbox as any).processes;
    const processes = await processesModule.list();
    const nodeProcess = processes.find((p: any) => p.cmd === 'node');

    if (!nodeProcess) {
      return NextResponse.json(
        { error: 'Node process not found' },
        { status: 404 }
      );
    }

    await processesModule.writeStdin(nodeProcess.pid, message + '\n');
    const reply = await processesModule.readStdoutLine(nodeProcess.pid);

    return NextResponse.json({ reply });
  } catch (error) {
    console.error('[sandbox/message] Error:', error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
