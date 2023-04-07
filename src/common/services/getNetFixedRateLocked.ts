export const getNetFixedRateLocked = (
  currentNetFixedRate: number,
  currentNetNotional: number,
  incomingSwapFixedRate: number,
  incomingSwapNotional: number,
): number => {
  let netFixedRateLocked = incomingSwapFixedRate;

  if (currentNetNotional > 0) {
    // currently net variable taker

    if (incomingSwapNotional > 0) {
      // variable taker is doubling down their variable taker exposure
      netFixedRateLocked =
        currentNetFixedRate * (currentNetNotional / (currentNetNotional + incomingSwapNotional)) +
        incomingSwapFixedRate *
          (incomingSwapNotional / (currentNetNotional + incomingSwapNotional));
    } else {
      // variable taker is bringing their exposure down

      if (incomingSwapNotional + currentNetNotional > 0) {
        netFixedRateLocked = currentNetFixedRate;
      }
    }
  } else {
    // currently net fixed taker

    if (incomingSwapNotional < 0) {
      // fixed taker is doubling down their fixed taker exposure
      netFixedRateLocked =
        currentNetFixedRate * (-currentNetNotional / (-currentNetNotional - incomingSwapNotional)) +
        incomingSwapFixedRate *
          (-incomingSwapNotional / (-currentNetNotional - incomingSwapNotional));
    } else {
      // fixed taker is bringing their exposure down

      if (incomingSwapNotional + currentNetNotional < 0) {
        netFixedRateLocked = currentNetFixedRate;
      }
    }
  }
  
  return netFixedRateLocked;
};
