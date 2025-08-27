export const totals = { total: 0, errors: 0 }
import client from 'prom-client'

export const register = new client.Registry()
client.collectDefaultMetrics({ register })

export const httpRequests = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status'],
})
register.registerMetric(httpRequests)

export const httpDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests',
  labelNames: ['method', 'route'],
  buckets: [0.1, 0.3, 1.5, 5, 10],
})
register.registerMetric(httpDuration)

export const aiTokens = new client.Counter({
  name: 'ai_tokens_spent_total',
  help: 'AI tokens spent',
  labelNames: ['action', 'plan'],
})
register.registerMetric(aiTokens)

export const queueJobsActive = new client.Gauge({
  name: 'queue_jobs_active',
  help: 'Active jobs in queue',
})
register.registerMetric(queueJobsActive)

export const billingPayments = new client.Counter({
  name: 'billing_payments_total',
  help: 'Payments processed',
  labelNames: ['status'],
})
register.registerMetric(billingPayments)
