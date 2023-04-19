import { MintOrBurnEventInfo } from '../../common/event-parsers/types';
import { getTimestampInSeconds } from '../../common/utils';
import { BigQueryMintOrBurnRow } from '../pull-data/types';

export const generateMintOrBurnRow = (eventInfo: MintOrBurnEventInfo): BigQueryMintOrBurnRow => {
  const rowLastUpdatedTimestamp = getTimestampInSeconds();

  return {
    ...eventInfo,
    eventTimestamp: 0,
    rowLastUpdatedTimestamp: rowLastUpdatedTimestamp,
  };
};
