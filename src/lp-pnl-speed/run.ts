import { BigQuery } from '@google-cloud/bigquery';
import { AMM } from '@voltz-protocol/v1-sdk';
import * as dotenv from 'dotenv';
import { Redis } from 'ioredis';

import { createActiveSwapsTable, createCacheTable, createMintsAndBurnsTable, createPositionsTable } from '../big-query-support/manage-tables';
import { ACTIVE_SWAPS_TABLE_NAME, APR_2023_TIMESTAMP, getAmms, LAST_PROCESSED_BLOCK_TABLE_NAME, MINTS_BURNS_TABLE_NAME, POSITIONS_TABLE_NAME, PROJECT_ID } from '../common';
import { sync } from './sync';

dotenv.config();

export const run = async (chainIds: number[], redisClient?: Redis) => {
  const bigQuery = new BigQuery({
    projectId: PROJECT_ID,
  });

  const amms: AMM[] = await getAmms(chainIds, APR_2023_TIMESTAMP);

  if (amms.length === 0) {
    console.log('amms list empty');
    return;
  }

  await createActiveSwapsTable(ACTIVE_SWAPS_TABLE_NAME, bigQuery);
  await createMintsAndBurnsTable(MINTS_BURNS_TABLE_NAME, bigQuery);
  await createPositionsTable(POSITIONS_TABLE_NAME, bigQuery);
  await createCacheTable(LAST_PROCESSED_BLOCK_TABLE_NAME, bigQuery);

  while (true) {
    try {
      await sync(bigQuery, amms, redisClient);
    } catch (error) {
      console.log(`Loop has failed with message: ${(error as Error).message}. It will retry...`);
    }
  }
};
