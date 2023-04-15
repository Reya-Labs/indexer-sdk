import { BigQuery } from '@google-cloud/bigquery';
import { ExtendedEvent } from '../../common/types';

export const processLpSpeedEvent = async (
  bigQuery: BigQuery,
  event: ExtendedEvent,
): Promise<void> => {

  const eventInfo = parseEvent(event);

  
};
