import { AMM } from '@voltz-protocol/v1-sdk';
import { ethers } from 'ethers';

import { VAMMPriceChangeEventInfo } from './types';

export const parseVAMMPriceChangeEvent = (
  event: ethers.Event,
  amm: AMM,
  chainId: number,
  isInitial: boolean,
): VAMMPriceChangeEventInfo => {
  const eventId = `${event.blockHash}_${event.transactionHash}_${event.logIndex}`;
  const tick = event.args?.tick as number;

  return {
    ...event,
    eventId: eventId.toLowerCase(),
    type: 'price_change',

    chainId: chainId,
    vammAddress: amm.id.toLowerCase(),
    amm,

    rateOracle: amm.rateOracle.protocol,
    underlyingToken: amm.underlyingToken.name,
    marginEngineAddress: amm.marginEngineAddress,

    isInitial,
    tick,
  };
};
