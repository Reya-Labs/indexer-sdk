import { BigQuery } from '@google-cloud/bigquery';
import { AMM } from '@voltz-protocol/v1-sdk';

import { getPreviousEvents } from '../common';
import { processSwapEvent } from './processSwapEvent';

export const sync = async (
  bigQuery: BigQuery,
  amms: AMM[],
  fromBlock: number,
  toBlock: number,
): Promise<void> => {
  const previousSwapEvents = await getPreviousEvents(amms, ['swap'], fromBlock, toBlock);

  const promises = Object.values(previousSwapEvents).map(async ({ events }) => {
    for (const swapEvent of events) {
      await processSwapEvent(bigQuery, swapEvent);
    }
  });

  const output = await Promise.allSettled(promises);
  output.forEach((v) => {
    if (v.status === 'rejected') {
      throw v.reason;
    }
  });
};
