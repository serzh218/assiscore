export const PLANS = {
  FREE: {
    genPerMonth: 5,
    privateProjects: 0,
    githubExport: false,
    deploy: false,
    monthlyTokens: 500,
    assistantCallsPerHour: 20,
  },
  PRO: {
    genPerMonth: 50,
    privateProjects: 10,
    githubExport: true,
    deploy: true,
    monthlyTokens: 5000,
    assistantCallsPerHour: 200,
  },
} as const;

export const COSTS = {
  generationBase: 60,
  generationPer1000Chars: 25,
  figmaImport: 40,
  patch: 20,
} as const;

export const ASSISTANT_CONTEXT_TOKENS = 16000;

export type PlanKey = keyof typeof PLANS;
