import { BigQuery } from '@google-cloud/bigquery';
import * as dotenv from 'dotenv';

import { APR_2023_TIMESTAMP, getAmms, PROJECT_ID, sleep } from '../common';
import { sync } from './sync';

dotenv.config();

export const run = async (chainIds: number[]) => {
  // retrieve BigQuery object for the given project
  const bigQuery = new BigQuery({
    projectId: PROJECT_ID,
  });

  // fetch AMMs
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
      await sleep(60 * 1000); // sleep 60s
    }
  }
};
