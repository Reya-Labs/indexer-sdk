import { getTimeInYearsBetweenTimestamps } from '../utils';
import { getFixedRateLocked } from './getFixedRateLocked';

type GetFixedRateLockedFromBalancesArgs = {
  variableTokenDelta: number;
  fixedTokenDelta: number;
  startTimestamp: number;
  currentTimestamp: number;
  maturityTimestamp: number;
  variableFactorStartToCurrent: number;
};

export const getFixedRateLockedFromBalances = ({
  variableTokenDelta,
  fixedTokenDelta,
  startTimestamp,
  currentTimestamp,
  maturityTimestamp,
  variableFactorStartToCurrent,
}: GetFixedRateLockedFromBalancesArgs): number => {
  const fixedFactorStartToMaturity =
    getTimeInYearsBetweenTimestamps(startTimestamp, maturityTimestamp) * 0.01;

  const fixedFactorCurrentToMaturity =
    getTimeInYearsBetweenTimestamps(currentTimestamp, maturityTimestamp) * 0.01;

  const fixedTokenDeltaUnbalanced =
    (fixedFactorStartToMaturity * fixedTokenDelta +
      variableTokenDelta * variableFactorStartToCurrent) /
    fixedFactorCurrentToMaturity;

  const fixedRateLocked = getFixedRateLocked(variableTokenDelta, fixedTokenDeltaUnbalanced);

  return fixedRateLocked;
};
