import { getNotionalFromLiquidity } from '@voltz-protocol/v1-sdk';
import { BigNumber, ethers } from 'ethers';

import { ExtendedEvent } from '../types';
import { MintOrBurnEventInfo } from './types';

export const parseMintOrBurnEvent = (event: ExtendedEvent): MintOrBurnEventInfo => {
  const eventId = `${event.blockHash}_${event.transactionHash}_${event.logIndex}`;
  const tokenDecimals = event.amm.underlyingToken.decimals;
  const ownerAddress = event.args?.owner as string;
  const tickLower = event.args?.tickLower as number;
  const tickUpper = event.args?.tickUpper as number;
  const amount = event.args?.amount as BigNumber;
  const amm = event.amm;
  const chainId = event.chainId;

  const notionalDelta = getNotionalFromLiquidity(amount, tickLower, tickUpper, tokenDecimals);
  const liquidityDelta = Number(ethers.utils.formatUnits(amount, tokenDecimals));

  return {
    eventId: eventId.toLowerCase(),
    chainId,
    vammAddress: event.amm.id.toLowerCase(),
    ownerAddress: ownerAddress.toLowerCase(),
    tickLower,
    tickUpper,
    notionalDelta : (event.type === 'burn') ? -notionalDelta : notionalDelta,
    rateOracle: event.amm.rateOracle.protocol,
    underlyingToken: event.amm.underlyingToken.name,
    marginEngineAddress: event.amm.marginEngineAddress,
    amm,
    type: event.type,
    eventBlockNumber: event.blockNumber,
    liquidityDelta: (event.type === 'burn') ? -liquidityDelta : liquidityDelta,
  };
};
