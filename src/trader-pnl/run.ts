import { BigQuery } from '@google-cloud/bigquery';
import * as dotenv from 'dotenv';

import { APR_2023_TIMESTAMP, getAmms, PROJECT_ID } from '../common';
import { sync } from  './sync';

dotenv.config();

export const run = async (chainIds: number[]) => {
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
      await sync(bigQuery, amms);
    } catch (error) {
      console.log(`Loop has failed with message: ${(error as Error).message}.`);
    }
  }
};
