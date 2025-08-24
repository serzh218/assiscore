import { Router } from 'express';
import { getEmitter } from '../sandboxManager';

const router = Router();

router.get('/logs/:sandboxId', (req, res) => {
  const { sandboxId } = req.params;
  const emitter = getEmitter(sandboxId);

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  if (!emitter) {
    res.write(`event: error\ndata: Sandbox ${sandboxId} not found\n\n`);
    res.end();
    return;
  }

  const sendStdout = (data: string) => {
    res.write(`data: ${JSON.stringify({ stream: 'stdout', line: data })}\n\n`);
  };
  const sendStderr = (data: string) => {
    res.write(`data: ${JSON.stringify({ stream: 'stderr', line: data })}\n\n`);
  };

  emitter.on('stdout', sendStdout);
  emitter.on('stderr', sendStderr);

  req.on('close', () => {
    emitter.off('stdout', sendStdout);
    emitter.off('stderr', sendStderr);
  });
});

export default router;
