import { BigQuery } from '@google-cloud/bigquery';
import { AMM } from '@voltz-protocol/v1-sdk';
import { Redis } from 'ioredis';

import { getPreviousEvents, setFromBlock } from '../common';
import { processMintOrBurnEvent } from './processMintAndBurnEvent';

export const sync = async (bigQuery: BigQuery, amms: AMM[], redisClient?: Redis): Promise<void> => {
  const previousMintEvents = await getPreviousEvents('mint_burn', amms, ['mint', 'burn'], bigQuery);

  const promises = Object.values(previousMintEvents).map(async ({ events }) => {
    for (const event of events) {
      await processMintOrBurnEvent(bigQuery, event);
      
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
  });

  const output = await Promise.allSettled(promises);
  output.forEach((v) => {
    if (v.status === 'rejected') {
      throw v.reason;
    }
  });
};
