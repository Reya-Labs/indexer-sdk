import { AMM } from '@voltz-protocol/v1-sdk';

import { getTimeInYearsBetweenTimestamps } from '../utils';

export const getRealizedPnLSinceLastSwap = async (
  amm: AMM,
  currentTimestampInSeconds: number,
  lastUpdatedTimestampInSeconds: number,
  currentFixedRateNumber: number,
  currentNetNotionalNumber: number,
): Promise<number> => {
  const timeDeltaInYears = getTimeInYearsBetweenTimestamps(
    lastUpdatedTimestampInSeconds,
    currentTimestampInSeconds,
  );

  let fixedFactor = currentFixedRateNumber * timeDeltaInYears;

  if (currentNetNotionalNumber > 0) {
    fixedFactor = fixedFactor * -1.0;
  }

  const variableFactor = await amm.variableFactor(
    lastUpdatedTimestampInSeconds * 1000,
    currentTimestampInSeconds * 1000,
  );

  const realizedPnLSinceLastSwap = currentNetNotionalNumber * (variableFactor.scaled + fixedFactor);

  return realizedPnLSinceLastSwap;
};
