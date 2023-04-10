import { getTimeInYearsBetweenTimestamps } from "../../common/utils";


export type GetFixedRateLockedFromBalancesArgs = {

    notionalLocked: number,
    cachedFixedTokenBalance: number,
    onChainFixedTokenBalance: number,
    currentTimestamp: number,
    startTimestamp: number,
    maturityTimestamp: number,
    variableFactor: number

}


export const getFixedRateLockedFromBalances = ({
    notionalLocked,
    cachedFixedTokenBalance,
    onChainFixedTokenBalance,
    currentTimestamp,
    startTimestamp,
    maturityTimestamp,
    variableFactor
}: GetFixedRateLockedFromBalancesArgs): number => {

    const fixedTokenDeltaBalanced = cachedFixedTokenBalance - onChainFixedTokenBalance;

    const timeInYearsStartToCurrent = getTimeInYearsBetweenTimestamps(startTimestamp, currentTimestamp);
    const timeInYearsStartToMaturity = getTimeInYearsBetweenTimestamps(startTimestamp, maturityTimestamp);
    const numerator = (0.01 * timeInYearsStartToMaturity * fixedTokenDeltaBalanced + notionalLocked * variableFactor);
    const denominator = 0.01 * timeInYearsStartToMaturity - 0.01 * timeInYearsStartToCurrent;
    const fixedTokenDeltaUnbalanced = numerator / denominator;
    const fixedRateLocked = (Math.abs(fixedTokenDeltaUnbalanced) /  Math.abs(notionalLocked)) / 100;

    return fixedRateLocked;

}