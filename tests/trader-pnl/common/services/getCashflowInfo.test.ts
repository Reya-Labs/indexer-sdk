import { getCashflowInfo } from '../../../../src/common';

describe('cashflow info', () => {
  const ZERO = 0;
  const ONE_YEAR = 365 * 24 * 60 * 60;
  const TWO_YEARS = 2 * ONE_YEAR;

  const VARIABLE_FACTOR = 0.03;

  it('vt, vt', () => {
    const { netNotionalLocked, netFixedRateLocked, newCashflow, netTimestamp } = getCashflowInfo(
      {
        notional: 1000,
        fixedRate: 0.05,
        timestamp: ZERO,
      },
      {
        notional: 1000,
        fixedRate: 0.1,
        timestamp: ONE_YEAR,
      },
      TWO_YEARS,
      VARIABLE_FACTOR,
    );

    expect(netNotionalLocked).toBeCloseTo(2000);
    expect(netFixedRateLocked).toBeCloseTo(0.075);
    expect(newCashflow).toBeCloseTo(-20);
    expect(netTimestamp).toBeCloseTo(ONE_YEAR);
  });

  it('vt, small ft', () => {
    const { netNotionalLocked, netFixedRateLocked, newCashflow, netTimestamp } = getCashflowInfo(
      {
        notional: 1000,
        fixedRate: 0.05,
        timestamp: ZERO,
      },
      {
        notional: -500,
        fixedRate: 0.1,
        timestamp: ONE_YEAR,
      },
      TWO_YEARS,
      VARIABLE_FACTOR,
    );

    expect(netNotionalLocked).toBeCloseTo(500);
    expect(netFixedRateLocked).toBeCloseTo(0.05);
    expect(newCashflow).toBeCloseTo(-10 + 25);
    expect(netTimestamp).toBeCloseTo(ZERO);
  });

  it('vt, large ft', () => {
    const { netNotionalLocked, netFixedRateLocked, newCashflow, netTimestamp } = getCashflowInfo(
      {
        notional: 1000,
        fixedRate: 0.05,
        timestamp: ZERO,
      },
      {
        notional: -1500,
        fixedRate: 0.1,
        timestamp: ONE_YEAR,
      },
      TWO_YEARS,
      VARIABLE_FACTOR,
    );

    expect(netNotionalLocked).toBeCloseTo(-500);
    expect(netFixedRateLocked).toBeCloseTo(0.1);
    expect(newCashflow).toBeCloseTo(-20 + 50);
    expect(netTimestamp).toBeCloseTo(ONE_YEAR);
  });

  it('ft, ft', () => {
    const { netNotionalLocked, netFixedRateLocked, newCashflow, netTimestamp } = getCashflowInfo(
      {
        notional: -1000,
        fixedRate: 0.05,
        timestamp: ZERO,
      },
      {
        notional: -1000,
        fixedRate: 0.1,
        timestamp: ONE_YEAR,
      },
      TWO_YEARS,
      VARIABLE_FACTOR,
    );

    expect(netNotionalLocked).toBeCloseTo(-2000);
    expect(netFixedRateLocked).toBeCloseTo(0.075);
    expect(newCashflow).toBeCloseTo(20);
    expect(netTimestamp).toBeCloseTo(ONE_YEAR);
  });

  it('ft, small vt', () => {
    const { netNotionalLocked, netFixedRateLocked, newCashflow, netTimestamp } = getCashflowInfo(
      {
        notional: -1000,
        fixedRate: 0.05,
        timestamp: ZERO,
      },
      {
        notional: 500,
        fixedRate: 0.1,
        timestamp: ONE_YEAR,
      },
      TWO_YEARS,
      VARIABLE_FACTOR,
    );

    expect(netNotionalLocked).toBeCloseTo(-500);
    expect(netFixedRateLocked).toBeCloseTo(0.05);
    expect(newCashflow).toBeCloseTo(10 - 25);
    expect(netTimestamp).toBeCloseTo(ZERO);
  });

  it('ft, large vt', () => {
    const { netNotionalLocked, netFixedRateLocked, newCashflow, netTimestamp } = getCashflowInfo(
      {
        notional: -1000,
        fixedRate: 0.05,
        timestamp: ZERO,
      },
      {
        notional: 1500,
        fixedRate: 0.1,
        timestamp: ONE_YEAR,
      },
      TWO_YEARS,
      VARIABLE_FACTOR,
    );

    expect(netNotionalLocked).toBeCloseTo(500);
    expect(netFixedRateLocked).toBeCloseTo(0.1);
    expect(newCashflow).toBeCloseTo(20 - 50);
    expect(netTimestamp).toBeCloseTo(ONE_YEAR);
  });
});
