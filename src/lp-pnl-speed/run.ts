import { BigQuery } from '@google-cloud/bigquery';
import { AMM } from '@voltz-protocol/v1-sdk';
import * as dotenv from 'dotenv';
import { Redis } from 'ioredis';

import { APR_2023_TIMESTAMP, getAmms, PROJECT_ID } from '../common';
import { sync } from './sync';

dotenv.config();

export const runPassiveSwaps = async (chainIds: number[], redisClient?: Redis) => {
  const bigQuery = new BigQuery({
    projectId: PROJECT_ID,
  });

  const amms: AMM[] = await getAmms(chainIds, APR_2023_TIMESTAMP);

  if (amms.length === 0) {
    console.log('amms list empty');
    return;
  }

  while (true) {
    try {
      await sync(bigQuery, amms, redisClient);
    } catch (error) {
      console.log(`Loop has failed with message: ${(error as Error).message}. It will retry...`);
    }
  }
};
