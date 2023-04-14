import { BigQuery } from '@google-cloud/bigquery';
import { AMM } from '@voltz-protocol/v1-sdk';
import { Redis } from 'ioredis';

import { CACHE_SET_WINDOW, getPreviousEvents, setFromBlock } from '../common';
import { processSwapEvent } from './processSwapEvent';

export const syncActiveSwaps = async (
  bigQuery: BigQuery,
  amms: AMM[],
  redisClient?: Redis,
): Promise<void> => {
  const previousSwapEvents = await getPreviousEvents('active_swaps', amms, ['swap'], bigQuery);

  const promises = Object.values(previousSwapEvents).map(async ({ events, fromBlock }) => {

    const cacheSetWindow = CACHE_SET_WINDOW[events[0].chainId];
    let latestCachedBlock = fromBlock;

    for (const event of events) {
      await processSwapEvent(bigQuery, event);

      const currentBlock = event.blockNumber;
      const currentWindow = currentBlock - latestCachedBlock;

      if (currentWindow > cacheSetWindow) {

        const isSet = await setFromBlock(

          {
            syncProcessName: 'active_swaps',
            chainId: event.chainId,
            vammAddress: event.address,
            lastBlock: event.blockNumber,
            redisClient: redisClient,
            bigQuery: bigQuery
          }
            
        );

        latestCachedBlock = isSet ? event.blockNumber : latestCachedBlock;

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
