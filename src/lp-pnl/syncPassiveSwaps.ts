import { BigQuery } from '@google-cloud/bigquery';
import { AMM } from '@voltz-protocol/v1-sdk';

import { getPreviousSwapEvents } from '../common/swaps/getPreviousSwapEvents';
import { processPassiveSwapEvents } from './processPassiveSwapEvents';

export const syncPassiveSwaps = async (
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
