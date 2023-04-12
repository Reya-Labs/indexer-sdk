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

export const parseMintOrBurnEvent = (chainId: number, event: ExtendedEvent, isBurn: boolean): MintOrBurnEventInfo => {
  const eventId = (`${event.blockHash}_${event.transactionHash}_${event.logIndex}`).toLowerCase();
  const tokenDecimals = event.amm.underlyingToken.decimals;
  const ownerAddress = event.args?.owner as string;
  const tickLower = event.args?.tickLower as number;
  const tickUpper = event.args?.tickUpper as number;
  const amount = event.args?.amount as BigNumber;
  const amm = event.amm as AMM;

  let notionalDelta = getNotionalFromLiquidity(
    amount,
    tickLower,
    tickUpper,
    tokenDecimals,
  );

  if (isBurn) {
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
    rateOracle: event.amm.rateOracle.id,
    underlyingToken: event.amm.underlyingToken.id,
    marginEngineAddress: event.amm.marginEngineAddress,
    amm
  };
};
