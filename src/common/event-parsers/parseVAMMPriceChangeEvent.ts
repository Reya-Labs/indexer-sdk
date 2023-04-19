import { ExtendedEvent } from '../types';
import { VAMMPriceChangeEventInfo } from './types';

export const parseVAMMPriceChangeEvent = (event: ExtendedEvent): VAMMPriceChangeEventInfo => {
  const eventId = `${event.blockHash}_${event.transactionHash}_${event.logIndex}`;
  const tick = event.args?.tick as number;

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

    tick,
  };
};
