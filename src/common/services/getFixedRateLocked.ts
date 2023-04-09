import { ethers } from 'ethers';

import { WAD } from '../constants';

export const getFixedRateLocked = (
  variableTokenDelta: ethers.BigNumber,
  fixedTokenDeltaUnbalanced: ethers.BigNumber,
): number => {
  if (variableTokenDelta.eq(0)) {
    return 0;
  }

  const fixedRateLocked = fixedTokenDeltaUnbalanced
    .mul(WAD)
    .div(variableTokenDelta)
    .div(ethers.BigNumber.from(10).pow(2))
    .abs();

  return Number(ethers.utils.formatUnits(fixedRateLocked, 18));
};
