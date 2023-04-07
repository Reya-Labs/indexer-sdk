import { BigNumber } from 'ethers';

import { getFixedRateLocked } from '../../../../src/common';

describe('mainFn', () => {
  it('fixed rate locked, variable tokens > 0', () => {
    const fixedRateLocked = getFixedRateLocked(
        BigNumber.from(1),
        BigNumber.from(-2),
    );

    expect(fixedRateLocked).toBeCloseTo(0.02);
  });

  it('fixed rate locked , variable tokens < 0', () => {
    const fixedRateLocked = getFixedRateLocked(
        BigNumber.from(-1),
        BigNumber.from(2),
    );

    expect(fixedRateLocked).toBeCloseTo(0.02);
  });

  it('fixed rate locked , variable tokens = 0', () => {
    const fixedRateLocked = getFixedRateLocked(
        BigNumber.from(0),
        BigNumber.from(2),
    );

    expect(fixedRateLocked).toBeCloseTo(0);
  });

  it('fixed rate locked , variable tokens < 0, large numbers', () => {
    const fixedRateLocked = getFixedRateLocked(
        BigNumber.from(10000).pow(18),
        BigNumber.from(10000).pow(18),
    );

    expect(fixedRateLocked).toBeCloseTo(0.01);
  });
});
