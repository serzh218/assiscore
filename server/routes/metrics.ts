import express from 'express'
import { register } from '../obs/metrics'

export const metricsRouter = express.Router()

metricsRouter.get('/', async (_req, res) => {
  res.setHeader('Content-Type', register.contentType)
  res.send(await register.metrics())
})
