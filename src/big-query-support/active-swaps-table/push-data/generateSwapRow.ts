import { SwapEventInfo } from '../../../common/event-parsers/types';
import { getTimestampInSeconds } from '../../../common/utils';
import { BigQuerySwapRow } from '../../types';

export const generateSwapRow = (event: SwapEventInfo, eventTimestamp: number): BigQuerySwapRow => {
  const rowLastUpdatedTimestamp = getTimestampInSeconds();

  return {
    eventId: event.eventId,
    vammAddress: event.amm.id.toLowerCase(),
    ownerAddress: event.ownerAddress,
    tickLower: event.tickLower,
    tickUpper: event.tickUpper,

    variableTokenDelta: event.variableTokenDelta,
    fixedTokenDeltaUnbalanced: event.fixedTokenDeltaUnbalanced,
    feePaidToLps: event.feePaidToLps,

    eventBlockNumber: event.blockNumber,
    eventTimestamp: eventTimestamp,
    rowLastUpdatedTimestamp,

    rateOracle: event.rateOracle,
    underlyingToken: event.underlyingToken,
    marginEngineAddress: event.marginEngineAddress,
    chainId: event.chainId,
  };
};
