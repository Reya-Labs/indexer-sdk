import { AMM, getNotionalFromLiquidity } from '@voltz-protocol/v1-sdk';
import { BigNumber, ethers } from 'ethers';

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
};

export const parseMintOrBurnEvent = (chainId: number, amm: AMM, event: ethers.Event, isBurn: boolean): MintOrBurnEventInfo => {
  const eventId = (`${event.blockHash}_${event.transactionHash}_${event.logIndex}`).toLowerCase();
  const tokenDecimals = amm.underlyingToken.decimals;
  const ownerAddress = event.args?.owner as string;
  const tickLower = event.args?.tickLower as number;
  const tickUpper = event.args?.tickUpper as number;
  const amount = event.args?.amount as BigNumber;

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
    vammAddress: amm.id.toLowerCase(),
    ownerAddress: ownerAddress.toLowerCase(),
    tickLower,
    tickUpper,
    notionalDelta,
    rateOracle: amm.rateOracle.id,
    underlyingToken: amm.underlyingToken.id,
    marginEngineAddress: amm.marginEngineAddress,
  };
};
