import path from 'path'

import { Octokit } from '@octokit/rest'
import { Sandbox } from 'e2b'
import { Router } from 'express'
import fs from 'fs-extra'
import simpleGit from 'simple-git'

const router = Router()

router.post('/github', async (req, res) => {
  try {
    const { sandboxId, repoName, githubToken } = req.body

    if (!sandboxId || !repoName || !githubToken) {
      return res.status(400).send('Не предоставлены все необходимые данные.')
    }

    console.log(`[Экспорт] Подключение к сэндбоксу ${sandboxId}...`)
    const sandbox = await Sandbox.reconnect(sandboxId)

    const tempDir = path.join(process.cwd(), 'temp', repoName)
    await fs.ensureDir(tempDir)

    console.log(`[Экспорт] Скачивание файлов в ${tempDir}...`)
    await sandbox.filesystem.download(tempDir, '/home/user')
    await sandbox.close()

    console.log(`[Экспорт] Создание репозитория ${repoName} на GitHub...`)
    const octokit = new Octokit({ auth: githubToken })

    const { data: repoData } = await octokit.repos.createForAuthenticatedUser({
      name: repoName,
      private: true,
    })

    const repoUrl = repoData.clone_url
    console.log(`[Экспорт] Репозиторий успешно создан: ${repoUrl}`)

    const git = simpleGit(tempDir)
    await git.init()
    await git.add('./*')
    await git.commit('Initial commit from AssisCore')
    await git.addRemote('origin', repoUrl)

    console.log('[Экспорт] Отправка кода в репозиторий...')
    await git.push(['-u', 'origin', 'main'])

    await fs.remove(tempDir)
    console.log('[Экспорт] Временные файлы удалены. Экспорт завершен.')

    res.json({ success: true, message: 'Проект успешно экспортирован!', url: repoData.html_url })
  } catch (_error) {
    console.error('Ошибка в /api/export/github:', _error)
    res.status(500).send('Внутренняя ошибка сервера при экспорте')
  }
})

export const exportRouter = router
