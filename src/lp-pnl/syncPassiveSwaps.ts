import { BigQuery } from '@google-cloud/bigquery';
import { AMM } from '@voltz-protocol/v1-sdk';

import { applyProcessingWindow, getPreviousEvents, setFromBlock } from '../common';
import { LP_PROCESSING_WINDOW } from '../common';
import { processPassiveSwapEvents } from './processPassiveSwapEvents';

export const syncPassiveSwaps = async (
  bigQuery: BigQuery,
  amms: AMM[],
): Promise<void> => {
  const previousSwapEvents = await getPreviousEvents('passive_swaps_lp', amms, ['swap']);

  const promises = Object.values(previousSwapEvents).map(async ({ events }) => {
    const chainId = events[0].chainId;
    const minBlockInterval = LP_PROCESSING_WINDOW[chainId];
    const eventsWithInterval = applyProcessingWindow(events, minBlockInterval);
    for (const event of eventsWithInterval) {
      await processPassiveSwapEvents({
        bigQuery,
        event,
      });
      await setFromBlock('passive_swaps_lp', event.chainId, event.address, event.blockNumber);
    }
  });

  const output = await Promise.allSettled(promises);
  output.forEach((v) => {
    if (v.status === 'rejected') {
      throw v.reason;
    }
  });
};