import { getLockedInProfit } from './getLockedInProfit';
import { getRealizedPnLSinceLastSwap } from './getRealizedPnlSinceLastSwap';

export const getCashflowInfo = (
  net: {
    notional: number;
    fixedRate: number;
    timestamp: number; // in seconds
  },
  incoming: {
    notional: number;
    fixedRate: number;
    timestamp: number; // in seconds
  },
  maturityTimestamp: number, // in seconds
  variableFactorBetweenSwaps: number,
): {
  netNotionalLocked: number;
  netFixedRateLocked: number;
  newCashflow: number;
  netTimestamp: number;
} => {
  if (
    (net.notional >= 0 && incoming.notional >= 0) ||
    (net.notional <= 0 && incoming.notional <= 0)
  ) {
    // doubling down exposure

    const netFixedRateLocked =
      (net.notional * net.fixedRate + incoming.notional * incoming.fixedRate) /
      (net.notional + incoming.notional);

    const cashflowBetweenSwaps = getRealizedPnLSinceLastSwap(
      net.timestamp,
      incoming.timestamp,
      variableFactorBetweenSwaps,
      net.fixedRate,
      net.notional,
    );

    return {
      netFixedRateLocked,
      newCashflow: cashflowBetweenSwaps,
      netTimestamp: incoming.timestamp,
      netNotionalLocked: net.notional + incoming.notional,
    };
  }

  if (
    (net.notional >= 0 && net.notional + incoming.notional >= 0) ||
    (net.notional <= 0 && net.notional + incoming.notional <= 0)
  ) {
    // partial unwind

    const lockedInProfit = getLockedInProfit(
      incoming.notional,
      net.fixedRate,
      incoming.fixedRate,
      incoming.timestamp,
      maturityTimestamp,
    );

    const cashflowBetweenSwaps = getRealizedPnLSinceLastSwap(
      net.timestamp,
      incoming.timestamp,
      variableFactorBetweenSwaps,
      net.fixedRate,
      -incoming.notional,
    );

    return {
      netFixedRateLocked: net.fixedRate,
      newCashflow: lockedInProfit + cashflowBetweenSwaps,
      netTimestamp: net.timestamp,
      netNotionalLocked: net.notional + incoming.notional,
    };
  }

  if (
    (net.notional >= 0 && net.notional + incoming.notional <= 0) ||
    (net.notional <= 0 && net.notional + incoming.notional >= 0)
  ) {
    // full unwind + take the other direction

    const lockedInProfit = getLockedInProfit(
      -net.notional,
      net.fixedRate,
      incoming.fixedRate,
      incoming.timestamp,
      maturityTimestamp,
    );

    const cashflowBetweenSwaps = getRealizedPnLSinceLastSwap(
      net.timestamp,
      incoming.timestamp,
      variableFactorBetweenSwaps,
      net.fixedRate,
      net.notional,
    );

    return {
      netFixedRateLocked: incoming.fixedRate,
      newCashflow: lockedInProfit + cashflowBetweenSwaps,
      netTimestamp: incoming.timestamp,
      netNotionalLocked: net.notional + incoming.notional,
    };
  }

  throw new Error(`Could not reach here`);
};
