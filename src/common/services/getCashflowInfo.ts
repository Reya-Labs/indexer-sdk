export const getCashflowInfo = (
  net: {
    notional: number;
    fixedRate: number;
  },
  incoming: {
    notional: number;
    fixedRate: number;
  },
): {
  netNotionalLocked: number;
  netFixedRateLocked: number;
} => {
  if (
    (net.notional >= 0 && incoming.notional >= 0) ||
    (net.notional <= 0 && incoming.notional <= 0)
  ) {
    // doubling down exposure

    const netFixedRateLocked =
      (net.notional * net.fixedRate + incoming.notional * incoming.fixedRate) /
      (net.notional + incoming.notional);

    return {
      netFixedRateLocked,
      netNotionalLocked: net.notional + incoming.notional,
    };
  }

  if (
    (net.notional >= 0 && net.notional + incoming.notional >= 0) ||
    (net.notional <= 0 && net.notional + incoming.notional <= 0)
  ) {
    // partial unwind

    return {
      netFixedRateLocked: net.fixedRate,
      netNotionalLocked: net.notional + incoming.notional,
    };
  }

  if (
    (net.notional >= 0 && net.notional + incoming.notional <= 0) ||
    (net.notional <= 0 && net.notional + incoming.notional >= 0)
  ) {
    // full unwind + take the other direction

    return {
      netFixedRateLocked: incoming.fixedRate,
      netNotionalLocked: net.notional + incoming.notional,
    };
  }

  throw new Error(`Could not reach here ${net.notional}, ${incoming.notional}`);
};
