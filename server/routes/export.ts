import { Router } from 'express';
import { Sandbox } from 'e2b';
import { Octokit } from '@octokit/rest';
import simpleGit from 'simple-git';
import fs from 'fs-extra';
import path from 'path';

const router = Router();

router.post('/github', async (req, res) => {
  try {
    const { sandboxId, repoName, githubToken } = req.body;

    if (!sandboxId || !repoName || !githubToken) {
      return res.status(400).send('Не предоставлены все необходимые данные.');
    }

    // --- Шаг 1: Скачиваем файлы из сэндбокса ---
    console.log(`[Экспорт] Подключение к сэндбоксу ${sandboxId}...`);
    const sandbox = await Sandbox.reconnect(sandboxId);

    const tempDir = path.join(process.cwd(), 'temp', repoName);
    await fs.ensureDir(tempDir);

    console.log(`[Экспорт] Скачивание файлов в ${tempDir}...`);
    await sandbox.filesystem.download(tempDir, '/home/user');
    await sandbox.close();

    // --- Шаг 2: Создаем репозиторий на GitHub ---
    console.log(`[Экспорт] Создание репозитория ${repoName} на GitHub...`);
    const octokit = new Octokit({ auth: githubToken });

    const { data: repoData } = await octokit.repos.createForAuthenticatedUser({
      name: repoName,
      private: true, // Создаем приватный репозиторий
    });

    const repoUrl = repoData.clone_url;
    console.log(`[Экспорт] Репозиторий успешно создан: ${repoUrl}`);

    // --- Шаг 3: Инициализируем Git и отправляем код ---
    const git = simpleGit(tempDir);
    await git.init();
    await git.add('./*');
    await git.commit('Initial commit from AssisCore');
    await git.addRemote('origin', repoUrl);

    // Аутентификация для push
    const authRepoUrl = repoUrl.replace('https://', `https://x-access-token:${githubToken}@`);

    console.log('[Экспорт] Отправка кода в репозиторий...');
    await git.push(['-u', 'origin', 'main']);

    // --- Шаг 4: Очистка ---
    await fs.remove(tempDir);
    console.log('[Экспорт] Временные файлы удалены. Экспорт завершен.');

    res.json({ success: true, message: 'Проект успешно экспортирован!', url: repoData.html_url });
  } catch (error) {
    console.error('Ошибка в /api/export/github:', error);
    res.status(500).send('Внутренняя ошибка сервера при экспорте');
  }
});

export default router;
