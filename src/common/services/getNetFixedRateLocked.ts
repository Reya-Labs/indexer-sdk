export const getNetFixedRateLocked = (
  currentNetFixedRate: number,
  currentNetNotional: number,
  incomingSwapFixedRate: number,
  incomingSwapNotional: number,
): number => {
  if (currentNetNotional > 0) {
    // currently net variable taker

    if (incomingSwapNotional > 0) {
      // variable taker is doubling down their variable taker exposure
      return (
        (currentNetFixedRate * currentNetNotional + incomingSwapFixedRate * incomingSwapNotional) /
        (currentNetNotional + incomingSwapNotional)
      );
    } else {
      if (incomingSwapNotional + currentNetNotional > 0) {
        // variable taker is bringing their exposure down
        return currentNetFixedRate;
      } else {
        return incomingSwapFixedRate;
      }
    }
  } else {
    // currently net fixed taker

    if (incomingSwapNotional < 0) {
      // fixed taker is doubling down their fixed taker exposure
      return (
        (currentNetFixedRate * currentNetNotional + incomingSwapFixedRate * incomingSwapNotional) /
        (currentNetNotional + incomingSwapNotional)
      );
    } else {
      // fixed taker is bringing their exposure down

      if (incomingSwapNotional + currentNetNotional < 0) {
        // variable taker is bringing their exposure down
        return currentNetFixedRate;
      } else {
        return incomingSwapFixedRate;
      }
    }
  }
};
