import { BigQuery } from '@google-cloud/bigquery';
import { AMM } from '@voltz-protocol/v1-sdk';
import { Redis } from 'ioredis';

import { getPreviousEvents, setFromBlock } from '../common';
import { processLpSpeedEvent } from './processLpSpeedEvent/processLpSpeedEvent';

export const sync = async (bigQuery: BigQuery, amms: AMM[], redisClient?: Redis): Promise<void> => {
  const promises = amms.map(async (amm) => {
    console.log(`Fetching events for AMM ${amm.id}`);

    const { fromTick, fromBlock, events } = await getPreviousEvents(
      'lp_speed',
      amm,
      ['mint', 'burn', 'price_change'],
      bigQuery,
    );

    let currentTick = fromTick;
    let latestCachedBlock = fromBlock;

    console.log(`Processing ${events.length} events from block ${fromBlock}...`);

    for (const event of events) {
      console.log(`Processing event: ${event.type}`);

      const newTick = await processLpSpeedEvent(bigQuery, event, currentTick);
      currentTick = newTick;

      const isSet = await setFromBlock({
        syncProcessName: 'lp_speed',
        chainId: event.chainId,
        vammAddress: event.address,
        lastBlock: event.blockNumber,
        redisClient: redisClient,
        bigQuery: bigQuery,
      });

      latestCachedBlock = isSet ? event.blockNumber : latestCachedBlock;

      console.log();
    }
  });

  const output = await Promise.allSettled(promises);
  output.forEach((v) => {
    if (v.status === 'rejected') {
      throw v.reason;
    }
  });
};

// todo: what if fromBlock is > vamm initialization, needs to be handled in the get previous events function
// todo: double check the fact that events are properly ordered sicne last time
// checked and the initialization of the vammm didn't come up first
// note this must be the initialization tick
