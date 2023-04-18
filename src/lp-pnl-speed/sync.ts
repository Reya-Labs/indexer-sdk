import { BigQuery } from '@google-cloud/bigquery';
import { AMM } from '@voltz-protocol/v1-sdk';
import { Redis } from 'ioredis';

import { CACHE_SET_WINDOW, getPreviousEvents, setFromBlock } from '../common';
import { processLpSpeedEvent } from './processLpSpeedEvent/processLpSpeedEvent';

export const sync = async (bigQuery: BigQuery, amms: AMM[], redisClient?: Redis): Promise<void> => {
  const previousEvents = await getPreviousEvents(
    'lp_speed',
    amms,
    ['mint', 'burn', 'price_change'],
    bigQuery,
  );

  const promises = Object.values(previousEvents).map(async ({ events, fromBlock, fromTick }) => {
    // todo: what if fromBlock is > vamm initialization, needs to be handled in the get previous events function
    // todo: double check the fact that events are properly ordered sicne last time
    // checked and the initialization of the vammm didn't come up first
    // note this must be the initialization tick
    let currentTick: number = fromTick as number;
    const cacheSetWindow = CACHE_SET_WINDOW[events[0].chainId];
    let latestCachedBlock = fromBlock;

    for (const event of events) {
      const newTick: number = await processLpSpeedEvent(bigQuery, event, currentTick);

      if (currentTick != newTick) {
        currentTick = newTick;
      }

      const currentBlock = event.blockNumber;
      const currentWindow = currentBlock - latestCachedBlock;

      const isSet = await setFromBlock({
        syncProcessName: 'lp_speed',
        chainId: event.chainId,
        vammAddress: event.address,
        lastBlock: event.blockNumber,
        redisClient: redisClient,
        bigQuery: bigQuery,
      });

      latestCachedBlock = isSet ? event.blockNumber : latestCachedBlock;

      // if (currentWindow > cacheSetWindow) {
      //   const isSet = await setFromBlock({
      //     syncProcessName: 'lp_speed',
      //     chainId: event.chainId,
      //     vammAddress: event.address,
      //     lastBlock: event.blockNumber,
      //     redisClient: redisClient,
      //     bigQuery: bigQuery,
      //   });

      //   latestCachedBlock = isSet ? event.blockNumber : latestCachedBlock;
      // }
    }
  });

  const output = await Promise.allSettled(promises);
  output.forEach((v) => {
    if (v.status === 'rejected') {
      throw v.reason;
    }
  });
};
