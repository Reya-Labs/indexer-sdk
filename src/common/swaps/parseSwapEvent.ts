import { AMM } from '@voltz-protocol/v1-sdk';
import { ethers } from 'ethers';

import { CHAIN_ID, getFixedRateLocked } from '..';

export type SwapEventInfo = {
  // todo: we should store the event timestamp in this object
  eventId: string;

  chainId: number;
  vammAddress: string;
  ownerAddress: string;
  tickLower: number;
  tickUpper: number;

  notionalLocked: number;
  fixedRateLocked: number;
  feePaidToLps: number;

  rateOracle: string;
  underlyingToken: string;
  marginEngineAddress: string;
};

export const parseSwapEvent = (amm: AMM, event: ethers.Event): SwapEventInfo => {
  const eventId = `${event.blockHash}_${event.transactionHash}_${event.logIndex}`;

  const tokenDecimals = amm.underlyingToken.decimals;

  const ownerAddress = event.args?.recipient as string;
  const tickLower = event.args?.tickLower as number;
  const tickUpper = event.args?.tickUpper as number;

  const variableTokenDelta = event.args?.variableTokenDelta as ethers.BigNumber;
  const fixedTokenDeltaUnbalanced = event.args?.fixedTokenDeltaUnbalanced as ethers.BigNumber;
  const cumulativeFeeIncurred = event.args?.cumulativeFeeIncurred as ethers.BigNumber;

  return {
    eventId: eventId.toLowerCase(),
    chainId: CHAIN_ID,
    vammAddress: amm.id.toLowerCase(),
    ownerAddress: ownerAddress.toLowerCase(),
    tickLower,
    tickUpper,
    notionalLocked: Number(ethers.utils.formatUnits(variableTokenDelta, tokenDecimals)),
    fixedRateLocked: getFixedRateLocked(variableTokenDelta, fixedTokenDeltaUnbalanced),
    feePaidToLps: Number(ethers.utils.formatUnits(cumulativeFeeIncurred, tokenDecimals)),
    rateOracle: amm.rateOracle.id,
    underlyingToken: amm.underlyingToken.id,
    marginEngineAddress: amm.marginEngineAddress,
  };
};
