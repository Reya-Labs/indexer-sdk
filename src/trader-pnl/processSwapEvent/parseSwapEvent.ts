import { AMM } from '@voltz-protocol/v1-sdk';
import { ethers } from 'ethers';

import { getFixedRateLocked } from '../../common';

export const parseSwapEvent = async (amm: AMM, event: ethers.Event) => {
  const tokenDecimals = amm.underlyingToken.decimals;

  const ownerAddress = (event.args?.recipient as string).toLowerCase();
  const tickLower = event.args?.tickLower as number;
  const tickUpper = event.args?.tickUpper as number;

  const eventTimestamp = (await event.getBlock()).timestamp;

  const variableTokenDelta = event.args?.variableTokenDelta as ethers.BigNumber;
  const fixedTokenDeltaUnbalanced = event.args?.fixedTokenDeltaUnbalanced as ethers.BigNumber;
  const cumulativeFeeIncurred = event.args?.cumulativeFeeIncurred as ethers.BigNumber;

  return {
    vammAddress: amm.id.toLowerCase(),
    fixedRateLocked: getFixedRateLocked(variableTokenDelta, fixedTokenDeltaUnbalanced),
    notionalLocked: Number(ethers.utils.formatUnits(variableTokenDelta, tokenDecimals)),
    feePaidToLps: Number(ethers.utils.formatUnits(cumulativeFeeIncurred, tokenDecimals)),
    eventTimestamp,
    ownerAddress,
    tickLower,
    tickUpper,
  };
};
