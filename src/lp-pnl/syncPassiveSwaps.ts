import { BigQuery } from '@google-cloud/bigquery';
import { AMM } from '@voltz-protocol/v1-sdk';

import { getPreviousEvents } from '../common';
import { processPassiveSwapEvents } from './processPassiveSwapEvents';

export const syncPassiveSwaps = async (
  chainId: number,
  bigQuery: BigQuery,
  amms: AMM[],
  fromBlock: number,
  toBlock: number,
  minBlockInterval: number,
): Promise<void> => {
  const previousSwapEvents = await getPreviousEvents(amms, ['swap'], fromBlock, toBlock);

  const promises = Object.values(previousSwapEvents).map(async ({ amm, events }) => {
    let lastProcessedBlock = fromBlock;
    for (let i = 0; i < events.length; i++) {
      const event = events[i];

      if (event.blockNumber >= lastProcessedBlock + minBlockInterval || i + 1 === events.length) {
        await processPassiveSwapEvents({
          bigQuery,
          amm,
          event,
          chainId,
        });

        lastProcessedBlock = event.blockNumber;
      }
    }
  });

  const output = await Promise.allSettled(promises);
  output.forEach((v) => {
    if (v.status === 'rejected') {
      throw v.reason;
    }
  });
};
