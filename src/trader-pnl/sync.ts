import { BigQuery } from '@google-cloud/bigquery';
import { AMM } from '@voltz-protocol/v1-sdk';
import { ethers } from 'ethers';

import { getPreviousSwapEvents } from './getPreviousSwapEvents';
import { processSwapEvent } from './processSwapEvent';

export const sync = async (
  bigQuery: BigQuery,
  provider: ethers.providers.Provider,
  amms: AMM[],
): Promise<number> => {
  const previousSwapEvents = await getPreviousSwapEvents(provider, amms);

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

  await Promise.allSettled(promises);

  return counter;
};
