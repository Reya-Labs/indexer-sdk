import { BigQuery } from '@google-cloud/bigquery';
import { AMM } from '@voltz-protocol/v1-sdk';
import { Redis } from 'ioredis';

import { CACHE_SET_WINDOW, getPreviousEvents, setFromBlock } from '../common';
import { processLpSpeedEvent } from './processLpSpeedEvent/processLpSpeedEvent';

export const sync = async (bigQuery: BigQuery, amms: AMM[], redisClient?: Redis): Promise<void> => {
  const previousMintBurnSwapEvents = await getPreviousEvents(
    'lp_speed',
    amms,
    ['mint', 'burn', 'price_change', 'vamm_initialization'],
    bigQuery,
  );

  const promises = Object.values(previousMintBurnSwapEvents).map(async ({ events, fromBlock }) => {

    if (events[0].type !== 'vamm_initialization') {
      throw Error("First event must be vamm initialization");
    }

    // note this must be the initialization tick
    let currentTick: number = events[0].args?.tick;
    const cacheSetWindow = CACHE_SET_WINDOW[events[0].chainId];
    let latestCachedBlock = fromBlock;

    for (const event of events) {
      
      const newTick: number = await processLpSpeedEvent(bigQuery, event, currentTick);
       
      if (currentTick != newTick) {
        currentTick = newTick;
      }

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
