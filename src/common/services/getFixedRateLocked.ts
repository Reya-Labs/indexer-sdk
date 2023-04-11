export const getFixedRateLocked = (
  variableTokenDelta: number,
  fixedTokenDeltaUnbalanced: number,
): number => {
  if (variableTokenDelta === 0) {
    return 0;
  }

  return Math.abs(fixedTokenDeltaUnbalanced / variableTokenDelta / 100);
};
