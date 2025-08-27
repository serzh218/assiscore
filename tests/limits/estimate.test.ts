import { describe, it, expect } from 'vitest';
import { estimateGenerationCost, estimatePatchCost } from '@/lib/tokens';
import { COSTS } from '@/lib/limits';

describe('estimateGenerationCost', () => {
  it('10 chars without figma', () => {
    expect(estimateGenerationCost({ textLen: 10 })).toBe(85);
  });
  it('1200 chars with figma', () => {
    expect(estimateGenerationCost({ textLen: 1200, hasFigma: true })).toBe(150);
  });
  it('5000 chars without figma', () => {
    expect(estimateGenerationCost({ textLen: 5000 })).toBe(185);
  });
});

describe('estimatePatchCost', () => {
  it('returns fixed patch cost', () => {
    expect(estimatePatchCost()).toBe(COSTS.patch);
  });
});
