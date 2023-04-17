import { BigQuery } from '@google-cloud/bigquery';
import { AMM } from '@voltz-protocol/v1-sdk';
import { Redis } from 'ioredis';

import { CACHE_SET_WINDOW, getPreviousEvents, setFromBlock } from '../common';
import { processLpSpeedEvent } from './processLpSpeedEvent/processLpSpeedEvent';

export const sync = async (bigQuery: BigQuery, amms: AMM[], redisClient?: Redis): Promise<void> => {
  const previousMintBurnSwapEvents = await getPreviousEvents(
    'lp_speed',
    amms,
    ['mint', 'burn', 'price_change'],
    bigQuery,
  );

  const promises = Object.values(previousMintBurnSwapEvents).map(async ({ events, fromBlock }) => {
    const cacheSetWindow = CACHE_SET_WINDOW[events[0].chainId];
    let latestCachedBlock = fromBlock;

    for (const event of events) {
      await processLpSpeedEvent(bigQuery, event);

      const currentBlock = event.blockNumber;
      const currentWindow = currentBlock - latestCachedBlock;

      if (currentWindow > cacheSetWindow) {
        const isSet = await setFromBlock({
          syncProcessName: 'mint_burn',
          chainId: event.chainId,
          vammAddress: event.address,
          lastBlock: event.blockNumber,
          redisClient: redisClient,
          bigQuery: bigQuery,
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
