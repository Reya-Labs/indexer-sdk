import { ExtendedEvent } from '../types';
import { VAMMPriceChangeEventInfo } from './types';

export const parseVAMMPriceChangeEvent = (event: ExtendedEvent): VAMMPriceChangeEventInfo => {
  const eventId = `${event.blockHash}_${event.transactionHash}_${event.logIndex}`;
  const tick = event.args?.tick as number;
  const amm = event.amm;

  return {
    eventId: eventId.toLowerCase(),
    eventBlockNumber: event.blockNumber,
    chainId: event.chainId,
    vammAddress: event.amm.id.toLowerCase(),
    tick,
    rateOracle: event.amm.rateOracle.protocol,
    underlyingToken: event.amm.underlyingToken.name,
    marginEngineAddress: event.amm.marginEngineAddress,
    amm,
    type: event.type,
  };
};
