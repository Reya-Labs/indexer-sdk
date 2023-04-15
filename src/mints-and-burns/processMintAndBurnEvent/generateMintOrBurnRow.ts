import { BigQueryMintOrBurnRow } from '../../big-query-support';
import { getTimestampInSeconds } from '../../common';
import { MintOrBurnEventInfo } from '../../common/event-parsers/parseMintOrBurnEvent';

export const generateMintOrBurnRow = (
  eventInfo: MintOrBurnEventInfo,
  eventTimestamp: number,
): BigQueryMintOrBurnRow => {
  const rowLastUpdatedTimestamp = getTimestampInSeconds();

  return {
    ...eventInfo,
    eventTimestamp: eventTimestamp,
    rowLastUpdatedTimestamp: rowLastUpdatedTimestamp,
  };
};
