import { BigQuery } from '@google-cloud/bigquery';
import { AMM } from '@voltz-protocol/v1-sdk';
import { Redis } from 'ioredis';

import { CACHE_SET_WINDOW } from '../common/constants';
import { getPreviousEvents } from '../common/contract-services/getPreviousEvents';
import { setFromBlock } from '../common/services/cache';
import { processSwapEvent } from './processSwapEvent/processSwapEvent';

export const syncActiveSwaps = async (
  bigQuery: BigQuery,
  amms: AMM[],
  redisClient: Redis,
): Promise<void> => {
  const promises = amms.map(async (amm) => {
    const { events, fromBlock } = await getPreviousEvents(
      'active_swaps',
      amm,
      ['swap'],
      redisClient,
    );

    const cacheSetWindow = CACHE_SET_WINDOW[events[0].chainId];
    let latestCachedBlock = fromBlock;

    for (const event of events) {
      await processSwapEvent(bigQuery, event);

      const currentBlock = event.blockNumber;
      const currentWindow = currentBlock - latestCachedBlock;

      if (currentWindow > cacheSetWindow) {
        const isSet = await setFromBlock({
          syncProcessName: 'active_swaps',
          chainId: event.chainId,
          vammAddress: event.address,
          lastBlock: event.blockNumber,
          redisClient,
        });

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
