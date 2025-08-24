import { Router } from 'express';
import { getSandboxEntry } from '../sandboxManager';

const router = Router();

router.post('/execute', async (req, res) => {
  try {
    const { sandboxId, command, cwd = '/home/user/app' } = req.body;
    if (!sandboxId || !command) {
      return res.status(400).json({ error: 'sandboxId and command are required' });
    }

    const { sandbox, emitter } = await getSandboxEntry(sandboxId);

    // Start command execution without waiting for completion
    sandbox.commands
      .run(command, {
        cwd,
        on_stdout: (data: string) => emitter.emit('stdout', data),
        on_stderr: (data: string) => emitter.emit('stderr', data),
      })
      .catch((err: any) => emitter.emit('stderr', err.message));

    return res.json({ success: true });
  } catch (error: any) {
    console.error('[execute] Error:', error);
    return res.status(500).json({ error: error.message });
  }
});

export default router;
