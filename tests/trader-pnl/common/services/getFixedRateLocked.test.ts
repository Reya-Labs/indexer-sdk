import { getFixedRateLocked } from '../../../../src/common';

describe('fixed rate locked', () => {
  it('variable tokens > 0', () => {
    const fixedRateLocked = getFixedRateLocked(1, -2);

    expect(fixedRateLocked).toBeCloseTo(0.02);
  });

  it('variable tokens < 0', () => {
    const fixedRateLocked = getFixedRateLocked(-1, 2);

    expect(fixedRateLocked).toBeCloseTo(0.02);
  });

  it('variable tokens = 0', () => {
    const fixedRateLocked = getFixedRateLocked(0, 2);

    expect(fixedRateLocked).toBeCloseTo(0);
  });

  it('variable tokens < 0, large numbers', () => {
    const fixedRateLocked = getFixedRateLocked(10000000000, 10000000000);

    expect(fixedRateLocked).toBeCloseTo(0.01);
  });
});
