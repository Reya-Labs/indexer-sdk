import { getNotionalFromLiquidity } from '@voltz-protocol/v1-sdk';
import { BigNumber, ethers } from 'ethers';

import { ExtendedEvent } from '../types';
import { MintOrBurnEventInfo } from './types';

export const parseMintOrBurnEvent = (event: ExtendedEvent): MintOrBurnEventInfo => {
  const eventId = `${event.blockHash}_${event.transactionHash}_${event.logIndex}`;

  const ownerAddress = event.args?.owner as string;
  const tickLower = event.args?.tickLower as number;
  const tickUpper = event.args?.tickUpper as number;
  const amount = event.args?.amount as BigNumber;

  const tokenDecimals = event.amm.underlyingToken.decimals;
  const notionalDelta = getNotionalFromLiquidity(amount, tickLower, tickUpper, tokenDecimals);
  const liquidityDelta = Number(ethers.utils.formatUnits(amount, tokenDecimals));

  return {
    eventId: eventId.toLowerCase(),
    type: event.type,
    eventBlockNumber: event.blockNumber,

    chainId: event.chainId,
    vammAddress: event.amm.id.toLowerCase(),
    amm: event.amm,

    rateOracle: event.amm.rateOracle.protocol,
    underlyingToken: event.amm.underlyingToken.name,
    marginEngineAddress: event.amm.marginEngineAddress,

    ownerAddress: ownerAddress.toLowerCase(),
    tickLower,
    tickUpper,

    notionalDelta: event.type === 'burn' ? -notionalDelta : notionalDelta,
    liquidityDelta: event.type === 'burn' ? -liquidityDelta : liquidityDelta,
  };
};
