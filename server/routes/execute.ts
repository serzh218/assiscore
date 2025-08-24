import { Router, Request, Response } from 'express';
import { Sandbox } from 'e2b';

const router = Router();

router.post('/', async (req: Request, res: Response) => {
  const { sandboxId, cmd } = req.body;

  if (!sandboxId || !cmd) {
    return res.status(400).json({ error: 'sandboxId and cmd are required' });
  }

  try {
    const sandbox = await Sandbox.reconnect(sandboxId);
    // Запускаем процесс, но НЕ ждем его завершения
    sandbox.process.start({ cmd });
    res.json({ message: 'Команда запущена' });
  } catch (error) {
    res.status(500).json({ error: 'Не удалось выполнить команду' });
  }
});

export default router;
