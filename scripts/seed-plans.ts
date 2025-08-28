import { prisma } from '@/lib/db'
import { PLANS } from '@/server/billing/plans'

async function main() {
  for (const plan of PLANS) {
    await prisma.plan.upsert({
      where: { code: plan.code },
      update: {
        priceCents: plan.priceCents,
        currency: plan.currency,
        features: plan.features,
        isActive: plan.isActive ?? true,
      },
      create: {
        code: plan.code,
        priceCents: plan.priceCents,
        currency: plan.currency,
        features: plan.features,
        isActive: plan.isActive ?? true,
      },
    })
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
