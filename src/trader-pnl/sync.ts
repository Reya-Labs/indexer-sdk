import { BigQuery } from '@google-cloud/bigquery';
import { AMM } from '@voltz-protocol/v1-sdk';

import { getPreviousEvents } from '../common';
import { processSwapEvent } from './processSwapEvent';

export const sync = async (
  bigQuery: BigQuery,
  amms: AMM[],
  previousBlockNumber: number,
): Promise<number> => {
  const previousSwapEvents = await getPreviousEvents(amms, 'swap', previousBlockNumber);

  let counter = 0;

  const promises = Object.values(previousSwapEvents).map(async ({ amm, events }) => {
    for (const swapEvent of events) {
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
