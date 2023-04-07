import { ethers } from 'ethers';

import { WAD } from '../constants';

export const getFixedRateLocked = (
  variableTokenDelta: ethers.BigNumber,
  fixedTokenDeltaUnbalanced: ethers.BigNumber,
): number => {
  const fixedRateLocked = variableTokenDelta
    .mul(WAD)
    .div(fixedTokenDeltaUnbalanced)
    .div(ethers.BigNumber.from(10).pow(2))
    .abs();

  return Number(ethers.utils.formatUnits(fixedRateLocked, 18));
};
