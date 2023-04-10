import { getTimeInYearsBetweenTimestamps } from '../utils';

export const getLockedInProfit = (
  unwindNotional: number,
  netFixedRateLocked: number,
  unwindFixedRate: number,
  unwindTimestampInSeconds: number,
  maturityTimestampInSeconds: number,
): number => {
  const timeUntilMaturity = getTimeInYearsBetweenTimestamps(
    unwindTimestampInSeconds,
    maturityTimestampInSeconds,
  );
  const deltaFixedRate = netFixedRateLocked - unwindFixedRate;

  return unwindNotional * deltaFixedRate * timeUntilMaturity;
};
