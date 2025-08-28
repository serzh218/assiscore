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
