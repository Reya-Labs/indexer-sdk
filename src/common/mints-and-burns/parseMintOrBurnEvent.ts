import { AMM, getNotionalFromLiquidity } from '@voltz-protocol/v1-sdk';
import { BigNumber } from 'ethers';

import { ExtendedEvent } from '../types';

export type MintOrBurnEventInfo = {
  eventId: string;
  chainId: number;
  vammAddress: string;
  ownerAddress: string;
  tickLower: number;
  tickUpper: number;
  notionalDelta: number;
  rateOracle: string;
  underlyingToken: string;
  marginEngineAddress: string;
  amm: AMM;
};

export const parseMintOrBurnEvent = (
  event: ExtendedEvent,
): MintOrBurnEventInfo => {
  const eventId = `${event.blockHash}_${event.transactionHash}_${event.logIndex}`.toLowerCase();
  const tokenDecimals = event.amm.underlyingToken.decimals;
  const ownerAddress = event.args?.owner as string;
  const tickLower = event.args?.tickLower as number;
  const tickUpper = event.args?.tickUpper as number;
  const amount = event.args?.amount as BigNumber;
  const amm = event.amm;
  const chainId = event.chainId;

  let notionalDelta = getNotionalFromLiquidity(amount, tickLower, tickUpper, tokenDecimals);

  if (event.type === 'burn') {
    notionalDelta = -1.0 * notionalDelta;
  }

  return {
    eventId,
    chainId,
    vammAddress: event.amm.id.toLowerCase(),
    ownerAddress: ownerAddress.toLowerCase(),
    tickLower,
    tickUpper,
    notionalDelta,
    rateOracle: event.amm.rateOracle.protocol,
    underlyingToken: event.amm.underlyingToken.name,
    marginEngineAddress: event.amm.marginEngineAddress,
    amm,
  };
};
