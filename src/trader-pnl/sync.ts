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

  for (const { amm, swapEvents } of Object.values(previousSwapEvents)) {
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
  }

  return counter;
};
