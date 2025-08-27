import cors from 'cors'
import express from 'express'

import { authRouter } from './server/routes/auth'
import { executeRouter } from './server/routes/execute'
import { exportRouter } from './server/routes/export'
import { logsRouter } from './server/routes/logs'
import { metricsRouter } from './server/routes/metrics'
import { sloRouter } from './server/routes/slo'
import { requestLogger, logger } from './server/obs/logger'
import { initTracing } from './server/obs/tracing'

initTracing()

const app = express()
app.use(cors())
app.use(express.json())
app.use(requestLogger)

app.use('/api/export', exportRouter)
app.use('/api/execute', executeRouter)
app.use('/api/logs', logsRouter)
app.use('/api/auth', authRouter)
app.use('/api/metrics', metricsRouter)
app.use('/api/slo', sloRouter)

const port = process.env.PORT || 3001
app.listen(port, () => {
  logger.info(`Server listening on port ${port}`)
})

export default app
