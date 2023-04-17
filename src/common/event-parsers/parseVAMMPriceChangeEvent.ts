import { AMM } from '@voltz-protocol/v1-sdk';

import { ExtendedEvent } from '../types';

export type VAMMPriceChangeEventInfo = {
  eventId: string;
  eventBlockNumber: number;
  chainId: number;
  vammAddress: string;
  ownerAddress: string;
  tickLower: number;
  tickUpper: number;

  tick: number;

  rateOracle: string;
  underlyingToken: string;
  marginEngineAddress: string;
  amm: AMM;
  type: string;
  eventTimestamp: number;
};

export const parseVAMMPriceChangeEvent = (event: ExtendedEvent): VAMMPriceChangeEventInfo => {
  const eventId = `${event.blockHash}_${event.transactionHash}_${event.logIndex}`;
  const ownerAddress = event.args?.recipient as string;
  const tickLower = event.args?.tickLower as number;
  const tickUpper = event.args?.tickUpper as number;
  const tick = event.args?.tick as number;

  const amm = event.amm;

  return {
    eventId: eventId.toLowerCase(),
    eventBlockNumber: event.blockNumber,
    chainId: event.chainId,
    vammAddress: event.amm.id.toLowerCase(),
    ownerAddress: ownerAddress.toLowerCase(),
    tickLower,
    tickUpper,
    tick,
    rateOracle: event.amm.rateOracle.protocol,
    underlyingToken: event.amm.underlyingToken.name,
    marginEngineAddress: event.amm.marginEngineAddress,
    amm,
    type: event.type,
    eventTimestamp: event.timestamp,
  };
};
