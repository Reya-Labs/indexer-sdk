import { BigQuery } from '@google-cloud/bigquery';
import { AMM } from '@voltz-protocol/v1-sdk';
import { Redis } from 'ioredis';

import { getPreviousEvents, setFromBlock } from '../common';
import { processMintEvent } from './processMintEvent';

export const syncMints = async (
  bigQuery: BigQuery,
  amms: AMM[],
  redisClient?: Redis,
): Promise<void> => {
  const previousMintEvents = await getPreviousEvents('mints_lp', amms, ['mint']);

  const promises = Object.values(previousMintEvents).map(async ({ events }) => {
    for (const swapEvent of events) {
      await processMintEvent(bigQuery, swapEvent);
      
        await setFromBlock(
          'mint_lp',
          swapEvent.chainId,
          swapEvent.address,
          swapEvent.blockNumber,
          redisClient,
          bigQuery
        );
      
    }
  });

  const output = await Promise.allSettled(promises);
  output.forEach((v) => {
    if (v.status === 'rejected') {
      throw v.reason;
    }
  });
};
