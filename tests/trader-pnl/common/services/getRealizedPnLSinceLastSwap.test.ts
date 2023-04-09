import { getRealizedPnLSinceLastSwap } from '../../../../src/common';

describe('realized PnL since last swap', () => {

  const tests: [[number, number, number, number, number], number][] = [
    [[0, 100 * 24 * 60 * 60, 0.02, 0.05, 1000], 6.3013698630137],
    [[0, 100 * 24 * 60 * 60, 0.01, 0.05, 1000], -3.6986301369863006],
    [[0, 0, 0, 0.01, 1000], 0],
    [[0, 365 * 24 * 60 * 60, 0.02, 0.01, 1000], 10],
  ];

  tests.forEach(([input, output]) => {
    it('fixed rate locked, variable tokens > 0', () => {
      const fixedRateLocked = getRealizedPnLSinceLastSwap(...input);
  
      expect(fixedRateLocked).toBeCloseTo(output);
    });
  })
});
