import { BigQuery } from '@google-cloud/bigquery';
import { AMM } from '@voltz-protocol/v1-sdk';
import { Redis } from 'ioredis';

import { applyProcessingWindow, CACHE_SET_WINDOW, getPreviousEvents, setFromBlock } from '../common';
import { LP_PROCESSING_WINDOW } from '../common';
import { processPassiveSwapEvents } from './processPassiveSwapEvents';

export const syncPassiveSwaps = async (
  bigQuery: BigQuery,
  amms: AMM[],
  redisClient?: Redis,
): Promise<void> => {
  const previousSwapEvents = await getPreviousEvents('passive_swaps_lp', amms, ['swap'], bigQuery);

  const promises = Object.values(previousSwapEvents).map(async ({ events, fromBlock }) => {
    const chainId = events[0].chainId;
    const minBlockInterval = LP_PROCESSING_WINDOW[chainId];
    const eventsWithInterval = applyProcessingWindow(events, minBlockInterval);

    const cacheSetWindow = CACHE_SET_WINDOW[events[0].chainId];
    let latestCachedBlock = fromBlock;

    for (const event of eventsWithInterval) {
      await processPassiveSwapEvents({
        bigQuery,
        event,
      });

      const currentBlock = event.blockNumber;
      const currentWindow = currentBlock - latestCachedBlock;

      if (currentWindow > cacheSetWindow) {

        await setFromBlock(
          {
            syncProcessName: 'passive_swaps_lp',
            chainId: event.chainId,
            vammAddress: event.address,
            lastBlock: event.blockNumber,
            redisClient: redisClient,
            bigQuery: bigQuery
  
          }
        );

        latestCachedBlock = event.blockNumber;

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
