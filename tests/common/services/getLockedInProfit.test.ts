import { getLockedInProfit } from '../../../src/common/services/getLockedInProfit';

describe('get locked in profit', () => {
  const tests: [[number, number, number, number, number], number][] = [
    [[-1000, 0.03, 0.05, 0, 365 * 24 * 60 * 60], 20],
  ];

  tests.forEach(([input, expectedOutput]) => {
    it('locked in profit', () => {
      const output = getLockedInProfit(...input);

      expect(output).toBeCloseTo(expectedOutput);
    });
  });
});
