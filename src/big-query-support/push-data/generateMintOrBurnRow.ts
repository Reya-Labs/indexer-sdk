import { MintOrBurnEventInfo } from '../../common/event-parsers/types';
import { getTimestampInSeconds } from '../../common/utils';
import { BigQueryMintOrBurnRow } from '../pull-data/types';

export const generateMintOrBurnRow = (
  event: MintOrBurnEventInfo,
  eventTimestamp: number,
): BigQueryMintOrBurnRow => {
  const rowLastUpdatedTimestamp = getTimestampInSeconds();

  return {
    eventId: event.eventId,
    vammAddress: event.amm.id.toLowerCase(),
    ownerAddress: event.ownerAddress,
    tickLower: event.tickLower,
    tickUpper: event.tickUpper,

    notionalDelta: event.notionalDelta,

    eventBlockNumber: event.blockNumber,
    eventTimestamp: eventTimestamp,
    rowLastUpdatedTimestamp,

    rateOracle: event.rateOracle,
    underlyingToken: event.underlyingToken,
    marginEngineAddress: event.marginEngineAddress,
    chainId: event.chainId,
  };
};
