import express from 'express'
import { getSlo } from '../obs/slo'

export const sloRouter = express.Router()

sloRouter.get('/', (_req, res) => {
  res.json(getSlo())
})
