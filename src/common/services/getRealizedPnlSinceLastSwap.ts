import { getTimeInYearsBetweenTimestamps } from '../utils';

export const getRealizedPnLSinceLastSwap = (
  lastSwapTimestamp: number,
  currentTimestamp: number,
  variableFactorSinceLastSwap: number,
  currentFixedRate: number,
  currentNetNotional: number,
): number => {
  const timeDeltaInYears = getTimeInYearsBetweenTimestamps(lastSwapTimestamp, currentTimestamp);

  const fixedFactor = currentFixedRate * timeDeltaInYears;
  return currentNetNotional * (variableFactorSinceLastSwap - fixedFactor);
};
