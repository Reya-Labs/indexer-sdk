import { BigQuery } from '@google-cloud/bigquery';
import { AMM } from '@voltz-protocol/v1-sdk';

import { getPreviousEvents } from '../common';
import { processPassiveSwapEvents } from './processPassiveSwapEvents';

export const syncPassiveSwaps = async (
  bigQuery: BigQuery,
  amms: AMM[],
  previousBlockNumber: number,
): Promise<number> => {
  const previousSwapEvents = await getPreviousEvents(amms, 'swap', previousBlockNumber);

  let counter = 0;

  const promises = Object.values(previousSwapEvents).map(async ({ amm, events }) => {
    for (const swapEvent of events) {
      // todo: check if the chain id can be extracted from the amm object
      await processPassiveSwapEvents({
        bigQuery,
        amm,
        event: swapEvent,
        chainId: 1,
        provider: amm.provider,
      });
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
