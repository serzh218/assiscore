import { Sandbox } from 'e2b'
import { Router } from 'express'

const router = Router()

router.get('/:sandboxId', async (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')

  const sandboxId = req.params.sandboxId

  try {
    const sandbox = await Sandbox.reconnect(sandboxId)

    sandbox.stdout.subscribe((log) => {
      res.write(`data: ${log.line}\n\n`)
    })

    sandbox.stderr.subscribe((log) => {
      res.write(`data: <span class="text-red-400">${log.line}</span>\n\n`)
    })

    req.on('close', () => {
      sandbox.close()
    })
  } catch (error: any) {
    res.write(`data: Ошибка подключения к логам: ${error.message}\n\n`)
    res.end()
  }
})

export const logsRouter = router
