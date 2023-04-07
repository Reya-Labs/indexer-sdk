import { BigQuery } from '@google-cloud/bigquery';

import { getTimestampInSeconds } from '../../common';
import { SwapEventInfo } from './parseSwapEvent';

export const generateSwapRow = (
  bigQuery: BigQuery,
  eventInfo: SwapEventInfo,
  eventTimestamp: number,
) => {
  const rowLastUpdatedTimestamp = getTimestampInSeconds();

  return {
    ...eventInfo,
    eventTimestamp: bigQuery.timestamp(eventTimestamp).value,
    rowLastUpdatedTimestamp: bigQuery.timestamp(rowLastUpdatedTimestamp).value,
  };
};
