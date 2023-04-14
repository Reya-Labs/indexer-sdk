import { BigQuery } from '@google-cloud/bigquery';
import { AMM } from '@voltz-protocol/v1-sdk';
import { Redis } from 'ioredis';

import { CACHE_SET_WINDOW, getPreviousEvents, setFromBlock } from '../common';
import { processMintOrBurnEvent } from './processMintAndBurnEvent';

export const sync = async (bigQuery: BigQuery, amms: AMM[], redisClient?: Redis): Promise<void> => {
  const previousMintEvents = await getPreviousEvents('mint_burn', amms, ['mint', 'burn'], bigQuery);

  const promises = Object.values(previousMintEvents).map(async ({ events, fromBlock }) => {

    // since all events that belong to a given vamm have the same chain id
    const cacheSetWindow = CACHE_SET_WINDOW[events[0].chainId];
    let latestCachedBlock = fromBlock;

    for (const event of events) {
      await processMintOrBurnEvent(bigQuery, event);

      const currentBlock = event.blockNumber;
      const currentWindow = currentBlock - latestCachedBlock;
      if (currentWindow > cacheSetWindow) {

        await setFromBlock(
          {
            syncProcessName: 'mint_burn',
            chainId: event.chainId,
            vammAddress: event.address,
            lastBlock: event.blockNumber,
            redisClient: redisClient,
            bigQuery: bigQuery
          }
        );

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
