import { BigQuery } from '@google-cloud/bigquery';
import { AMM } from '@voltz-protocol/v1-sdk';

import { getPreviousEvents } from '../common';
import { processPassiveSwapEvents } from './processPassiveSwapEvents';
import { LP_PROCESSING_WINDOW } from '../common';

export const syncPassiveSwaps = async (
  tableId: string,
  bigQuery: BigQuery,
  amms: AMM[]
): Promise<void> => {

  const previousSwapEvents = await getPreviousEvents(tableId, amms, ['swap']);

  const promises = Object.values(previousSwapEvents).map(async ({ events }) => {

    const chainId = events[0].chainId;
    const minBlockInterval = LP_PROCESSING_WINDOW[chainId];
    const eventsWithInterval = applyProcessingWindow(events, minBlockInterval);

    for (let i = 0; i < eventsWithInterval.length; i++) {
      const event = eventsWithInterval[i];

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
