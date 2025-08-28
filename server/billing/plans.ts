export interface Features {
  genPerMonth: number
  privateProjects: number
  githubExport: boolean
  deploy: boolean
  monthlyTokens: number
  assistantCallsPerHour: number
  testFirstCyclesPerMonth: number
}

export const PLANS: {
  code: string
  priceCents: number
  currency: string
  features: Features
  isActive?: boolean
}[] = [
  {
    code: 'FREE',
    priceCents: 0,
    currency: 'RUB',
    features: {
      genPerMonth: 5,
      privateProjects: 0,
      githubExport: false,
      deploy: false,
      monthlyTokens: 500,
      assistantCallsPerHour: 20,
      testFirstCyclesPerMonth: 3,
    },
  },
  {
    code: 'PRO',
    priceCents: 49900,
    currency: 'RUB',
    features: {
      genPerMonth: 50,
      privateProjects: 10,
      githubExport: true,
      deploy: true,
      monthlyTokens: 5000,
      assistantCallsPerHour: 200,
      testFirstCyclesPerMonth: 30,
    },
  },
]

export interface PlanWithFeatures {
  code: string
  priceCents: number
  currency: string
  features: Features
  isActive?: boolean
}

export async function listPlans(): Promise<PlanWithFeatures[]> {
  if (process.env.NODE_ENV === 'production') {
    const { prisma } = await import('@/lib/db')
    const plans = await prisma.plan.findMany({ where: { isActive: true } })
    return plans.map((p) => ({
      code: p.code,
      priceCents: p.priceCents,
      currency: p.currency,
      features: p.features as Features,
      isActive: p.isActive,
    }))
  }
  return PLANS.filter((p) => p.isActive !== false)
}

export async function getPlan(code: string): Promise<PlanWithFeatures | undefined> {
  const plans = await listPlans()
  return plans.find((p) => p.code === code)
}
