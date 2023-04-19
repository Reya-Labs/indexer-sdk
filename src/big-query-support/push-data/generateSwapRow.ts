import { SwapEventInfo } from '../../common/event-parsers/types';
import { getTimestampInSeconds } from '../../common/utils';
import { BigQuerySwapRow } from '../pull-data/types';

export const generateSwapRow = (
  eventInfo: SwapEventInfo,
  eventTimestamp: number,
): BigQuerySwapRow => {
  const rowLastUpdatedTimestamp = getTimestampInSeconds();

  return {
    ...eventInfo,
    eventTimestamp: eventTimestamp,
    rowLastUpdatedTimestamp: rowLastUpdatedTimestamp,
  };
};
