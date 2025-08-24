import { Router } from 'express';

const router = Router();

router.post('/github', async (req, res) => {
  try {
    const { sandboxId, repoName, githubToken } = req.body;
    console.log('Получен запрос на экспорт:', { sandboxId, repoName });

    // TODO: Добавить логику экспорта

    res.json({ success: true, message: 'Запрос на экспорт получен!' });
  } catch (error) {
    console.error('Ошибка в /api/export/github:', error);
    res.status(500).send('Внутренняя ошибка сервера');
  }
});

export default router;
