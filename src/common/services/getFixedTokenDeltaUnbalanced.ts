import { getTimeInYearsBetweenTimestamps } from '../utils';

type getFixedTokenDeltaUnbalancedArgs = {
  variableTokenDelta: number;
  fixedTokenDelta: number;
  startTimestamp: number;
  currentTimestamp: number;
  maturityTimestamp: number;
  variableFactorStartToCurrent: number;
};

export const getFixedTokenDeltaUnbalanced = ({
  variableTokenDelta,
  fixedTokenDelta,
  startTimestamp,
  currentTimestamp,
  maturityTimestamp,
  variableFactorStartToCurrent,
}: getFixedTokenDeltaUnbalancedArgs): number => {
  const fixedFactorStartToMaturity =
    getTimeInYearsBetweenTimestamps(startTimestamp, maturityTimestamp) * 0.01;

  const fixedFactorCurrentToMaturity =
    getTimeInYearsBetweenTimestamps(currentTimestamp, maturityTimestamp) * 0.01;

  const fixedTokenDeltaUnbalanced =
    (fixedFactorStartToMaturity * fixedTokenDelta +
      variableTokenDelta * variableFactorStartToCurrent) /
    fixedFactorCurrentToMaturity;

  return fixedTokenDeltaUnbalanced;
};
