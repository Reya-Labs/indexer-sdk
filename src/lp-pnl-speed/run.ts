import { BigQuery } from '@google-cloud/bigquery';
import { AMM } from '@voltz-protocol/v1-sdk';
import * as dotenv from 'dotenv';
import { Redis } from 'ioredis';

import { APR_2023_TIMESTAMP, getAmms, PROJECT_ID } from '../common';
import { sync } from './sync';
import { createCacheTable, createPositionsTable } from '../big-query-support/manage-tables';

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

  if (process.env.POSITIONS_TABLE_ID === undefined || process.env.POSITIONS_TABLE_ID === '') {
    throw Error('Make sure POSITIONS_TABLE_ID is provided as an environment variable');
  }

  if (
    process.env.LAST_PROCESSED_BLOCK_TABLE_ID === undefined ||
    process.env.LAST_PROCESSED_BLOCK_TABLE_ID === ''
  ) {
    throw Error('Make sure LAST_PROCESSED_BLOCK_TABLE_ID is provided as an environment variable');
  }

  // only creates a position table if it does not exist
  // note, atm the create position table script does not check wether
  // the matching position shares the same schema
  // todo: introduce a check on process.env.POSITIONS_TABLE_ID
  await createPositionsTable(process.env.POSITIONS_TABLE_ID, bigQuery);
  await createCacheTable(process.env.LAST_PROCESSED_BLOCK_TABLE_ID, bigQuery);

  while (true) {
    try {
      await sync(bigQuery, amms, redisClient);
    } catch (error) {
      console.log(`Loop has failed with message: ${(error as Error).message}. It will retry...`);
    }
  }
};
