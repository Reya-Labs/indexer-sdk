import { getFixedTokenDeltaUnbalanced } from '../../../src/common/services/getFixedTokenDeltaUnbalanced';

describe('fixed rate locked from balances', () => {
  it('variable tokens > 0, in the middle of 2-year pool', () => {
    const fixedTokenDeltaUnbalanced = getFixedTokenDeltaUnbalanced({
      variableTokenDelta: 1000,
      fixedTokenDelta: -5000,
      startTimestamp: 0,
      currentTimestamp: 365 * 24 * 60 * 60,
      maturityTimestamp: 2 * 365 * 24 * 60 * 60,
      variableFactorStartToCurrent: 0.03,
    });

    expect(fixedTokenDeltaUnbalanced).toBeCloseTo(-7000);
  });

  it('variable tokens > 0, in the middle of 1-year pool', () => {
    const fixedTokenDeltaUnbalanced = getFixedTokenDeltaUnbalanced({
      variableTokenDelta: 1000,
      fixedTokenDelta: -5000,
      startTimestamp: 0,
      currentTimestamp: (365 * 24 * 60 * 60) / 2,
      maturityTimestamp: 365 * 24 * 60 * 60,
      variableFactorStartToCurrent: 0.03,
    });

    expect(fixedTokenDeltaUnbalanced).toBeCloseTo(-4000);
  });

  it('variable tokens > 0, at the start', () => {
    const fixedTokenDeltaUnbalanced = getFixedTokenDeltaUnbalanced({
      variableTokenDelta: 1000,
      fixedTokenDelta: -5000,
      startTimestamp: 0,
      currentTimestamp: 0,
      maturityTimestamp: 365 * 24 * 60 * 60,
      variableFactorStartToCurrent: 0,
    });

    expect(fixedTokenDeltaUnbalanced).toBeCloseTo(-5000);
  });

  it('variable tokens < 0, in the middle of 2-year pool', () => {
    const fixedTokenDeltaUnbalanced = getFixedTokenDeltaUnbalanced({
      variableTokenDelta: -1000,
      fixedTokenDelta: 5000,
      startTimestamp: 0,
      currentTimestamp: 365 * 24 * 60 * 60,
      maturityTimestamp: 2 * 365 * 24 * 60 * 60,
      variableFactorStartToCurrent: 0.03,
    });

    expect(fixedTokenDeltaUnbalanced).toBeCloseTo(7000);
  });

  it('variable tokens < 0, in the middle of 1-year pool', () => {
    const fixedTokenDeltaUnbalanced = getFixedTokenDeltaUnbalanced({
      variableTokenDelta: -1000,
      fixedTokenDelta: 5000,
      startTimestamp: 0,
      currentTimestamp: (365 * 24 * 60 * 60) / 2,
      maturityTimestamp: 365 * 24 * 60 * 60,
      variableFactorStartToCurrent: 0.03,
    });

    expect(fixedTokenDeltaUnbalanced).toBeCloseTo(4000);
  });
});
