import { BigQuery } from '@google-cloud/bigquery';
import { AMM } from '@voltz-protocol/v1-sdk';

import { getPreviousSwapEvents } from './getPreviousSwapEvents';
import { processSwapEvent } from './processSwapEvent';

export const sync = async (
  bigQuery: BigQuery,
  amms: AMM[],
  previousBlockNumber: number,
): Promise<number> => {
  const previousSwapEvents = await getPreviousSwapEvents(amms, previousBlockNumber);

  let counter = 0;

  const promises = Object.values(previousSwapEvents).map(async ({ amm, swapEvents }) => {
    const sortedSwapEvents = swapEvents.sort((a, b) => {
      if (a.blockNumber === b.blockNumber) {
        return a.transactionIndex - b.transactionIndex;
      }

      return a.blockNumber - b.blockNumber;
    });

    for (const swapEvent of sortedSwapEvents) {
      await processSwapEvent(bigQuery, amm, swapEvent);
      counter++;
    }
  });

  const output = await Promise.allSettled(promises);
  output.forEach((v) => {
    if (v.status === 'rejected') {
      throw v.reason;
    }
  });

  return counter;
};
