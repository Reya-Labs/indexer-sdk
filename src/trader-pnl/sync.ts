import { BigQuery } from '@google-cloud/bigquery';
import { AMM } from '@voltz-protocol/v1-sdk';

import { processSwapEvent } from './processSwapEvent';
import { getPreviousEvents } from '../common';

export const sync = async (
  bigQuery: BigQuery,
  amms: AMM[],
  previousBlockNumber: number,
): Promise<number> => {
  const previousSwapEvents = await getPreviousEvents(amms, 'swap', previousBlockNumber);

  let counter = 0;

  const promises = Object.values(previousSwapEvents).map(async ({ amm, events }) => {
    const sortedSwapEvents = events.sort((a, b) => {
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
