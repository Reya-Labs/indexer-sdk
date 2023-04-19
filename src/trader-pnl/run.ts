import { BigQuery } from '@google-cloud/bigquery';
import * as dotenv from 'dotenv';
import Redis from 'ioredis';

import { APR_2023_TIMESTAMP, PROJECT_ID } from '../common/constants';
import { getAmms } from '../common/getAmms';
import { syncActiveSwaps } from './syncActiveSwaps';

dotenv.config();

export const run = async (chainIds: number[], redisClient?: Redis) => {
  const bigQuery = new BigQuery({
    projectId: PROJECT_ID,
  });

  const amms = await getAmms(chainIds, APR_2023_TIMESTAMP);

  if (amms.length === 0) {
    console.log('Skipping processing because the list of AMMs is empty.');
    return;
  }

  while (true) {
    try {
      await syncActiveSwaps(bigQuery, amms, redisClient);
    } catch (error) {
      console.log(`Loop has failed with message: ${(error as Error).message}.`);
    }
  }
};
