import { BigQuerySwapRow } from '../../big-query-support';
import { getTimestampInSeconds } from '../../common';
import { SwapEventInfo } from '../../common/event-parsers/parseSwapEvent';

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
