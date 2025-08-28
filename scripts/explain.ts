import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const ownerId = process.argv[2]
  if (!ownerId) {
    console.error('Usage: ts-node scripts/explain.ts <ownerId>')
    process.exit(1)
  }
  console.log('EXPLAIN ANALYZE for projects...')
  const res = await prisma.$queryRawUnsafe(`
    EXPLAIN (ANALYZE, BUFFERS, VERBOSE)
    SELECT * FROM "Project"
    WHERE "ownerId" = '${ownerId}'
    ORDER BY "updatedAt" DESC
    LIMIT 20;
  `)
  console.log(res)
}

main().finally(() => prisma.$disconnect())
