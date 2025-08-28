import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient
}

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV !== 'production' ? ['query', 'error', 'warn'] : ['error'],
  })

const SLOW_MS = 150

if (!globalForPrisma.prisma) {
  prisma.$use(async (params, next) => {
    const start = Date.now()
    const result = await next(params)
    const ms = Date.now() - start
    if (ms > SLOW_MS) {
      console.warn(`[DB SLOW] ${params.model}.${params.action} ${ms}ms`, { args: params.args })
    }
    return result
  })
}

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
