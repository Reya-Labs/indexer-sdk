export const calculatePassiveTokenDeltas = (
  liquidity: number,
  tickLower: number,
  tickUpper: number,
  tickPrevious: number,
  tickCurrent: number,
): {
  variableTokenDelta: number;
  fixedTokenDeltaUnbalanced: number;
} => {
  if (tickPrevious === tickCurrent) {
    return {
      variableTokenDelta: 0,
      fixedTokenDeltaUnbalanced: 0,
    };
  }

  const isVT = tickCurrent > tickPrevious;

  let tradedLower = Math.min(tickPrevious, tickCurrent);
  let tradedUpper = Math.max(tickPrevious, tickCurrent);

  // no overlap, LP is not affected by this trade
  if (tradedLower >= tickUpper || tradedUpper <= tickLower) {
    return {
      variableTokenDelta: 0,
      fixedTokenDeltaUnbalanced: 0,
    };
  }

  tradedLower = Math.max(tradedLower, tickLower);
  tradedUpper = Math.min(tradedUpper, tickUpper);

  const sqrtPriceLower = Math.pow(1.0001, tradedLower / 2);
  const sqrtPriceUpper = Math.pow(1.0001, tradedUpper / 2);

  const absVariableTokenDelta = liquidity * (sqrtPriceUpper - sqrtPriceLower);
  const absUnbalancedFixedTokenDelta =
    (liquidity * (sqrtPriceUpper - sqrtPriceLower)) / sqrtPriceUpper / sqrtPriceLower;

  return {
    variableTokenDelta: isVT ? absVariableTokenDelta : -absVariableTokenDelta,
    fixedTokenDeltaUnbalanced: isVT ? -absUnbalancedFixedTokenDelta : absUnbalancedFixedTokenDelta,
  };
};
