import { BigQuery } from '@google-cloud/bigquery';
import { AMM } from '@voltz-protocol/v1-sdk';

import { getPreviousEvents } from '../common';
import { processPassiveSwapEvents } from './processPassiveSwapEvents';
import { LP_PROCESSING_WINDOW, sleep } from '../common';

export const syncPassiveSwaps = async (
  tableId: string,
  bigQuery: BigQuery,
  amms: AMM[]
): Promise<void> => {

  const previousSwapEvents = await getPreviousEvents(tableId, amms, ['swap']);

  const promises = Object.values(previousSwapEvents).map(async ({ events }) => {

    for (let i = 0; i < events.length; i++) {
      const event = events[i];

      await processPassiveSwapEvents({
        bigQuery,
        event,
      });
      
    }
  });

  const output = await Promise.allSettled(promises);
  output.forEach((v) => {
    if (v.status === 'rejected') {
      throw v.reason;
    }
  });
};
