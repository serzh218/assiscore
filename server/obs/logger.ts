import pino, { DestinationStream } from 'pino'
import { context, trace } from '@opentelemetry/api'
import type { Request, Response, NextFunction } from 'express'
import { httpDuration, httpRequests, totals } from './metrics'

export function createLogger(dest?: DestinationStream) {
  return pino(
    {
      level: process.env.LOG_LEVEL || 'info',
      transport:
        process.env.NODE_ENV === 'development'
          ? { target: 'pino-pretty', options: { colorize: true } }
          : undefined,
      mixin() {
        const span = trace.getSpan(context.active())
        return span ? { traceId: span.spanContext().traceId } : {}
      },
    },
    dest,
  )
}

export const logger = createLogger()

export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const start = Date.now()
  res.on('finish', () => {
    const duration = Date.now() - start
    const route = req.route?.path || req.originalUrl
    httpRequests.inc({ method: req.method, route, status: String(res.statusCode) })
    httpDuration.observe({ method: req.method, route }, duration / 1000)
    totals.total++
    if (res.statusCode >= 400) totals.errors++
    logger.info(
      { method: req.method, url: req.originalUrl, status: res.statusCode, duration },
      'request',
    )
  })
  next()
}
