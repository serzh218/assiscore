export const PLANS = {
  FREE: {
    genPerMonth: 5,
    privateProjects: 0,
    githubExport: false,
    deploy: false,
    monthlyTokens: 500,
  },
  PRO: {
    genPerMonth: 50,
    privateProjects: 10,
    githubExport: true,
    deploy: true,
    monthlyTokens: 5000,
  },
} as const;

export const COSTS = {
  generationBase: 60,
  generationPer1000Chars: 25,
  figmaImport: 40,
  patch: 20,
} as const;

export type PlanKey = keyof typeof PLANS;
