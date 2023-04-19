import { getTimestampInSeconds } from '../../common';
import { MintOrBurnEventInfo } from '../../common/event-parsers';
import { BigQueryMintOrBurnRow } from '..';

export const generateMintOrBurnRow = (eventInfo: MintOrBurnEventInfo): BigQueryMintOrBurnRow => {
  const rowLastUpdatedTimestamp = getTimestampInSeconds();

  return {
    ...eventInfo,
    eventTimestamp: 0,
    rowLastUpdatedTimestamp: rowLastUpdatedTimestamp,
  };
};
