import { AMM, getNotionalFromLiquidity } from '@voltz-protocol/v1-sdk';
import { BigNumber, ethers } from 'ethers';

import { MintOrBurnEventInfo } from './types';

export const parseMintOrBurnEvent = (
  event: ethers.Event,
  amm: AMM,
  chainId: number,
  isMint: boolean,
): MintOrBurnEventInfo => {
  const eventId = `${event.blockHash}_${event.transactionHash}_${event.logIndex}`;

  const ownerAddress = event.args?.owner as string;
  const tickLower = event.args?.tickLower as number;
  const tickUpper = event.args?.tickUpper as number;
  const amount = event.args?.amount as BigNumber;

  const tokenDecimals = amm.underlyingToken.decimals;
  const notionalDelta = getNotionalFromLiquidity(amount, tickLower, tickUpper, tokenDecimals);
  const liquidityDelta = Number(ethers.utils.formatUnits(amount, tokenDecimals));

  return {
    ...event,
    eventId: eventId.toLowerCase(),
    type: isMint ? 'mint' : 'burn',

    chainId: chainId,
    vammAddress: amm.id.toLowerCase(),
    amm,

    rateOracle: amm.rateOracle.protocol,
    underlyingToken: amm.underlyingToken.name,
    marginEngineAddress: amm.marginEngineAddress,

    ownerAddress: ownerAddress.toLowerCase(),
    tickLower,
    tickUpper,

    notionalDelta: (isMint ? 1 : -1) * notionalDelta,
    liquidityDelta: (isMint ? 1 : -1) * liquidityDelta,
  };
};
