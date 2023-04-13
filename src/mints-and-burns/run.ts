import { BigQuery } from '@google-cloud/bigquery';
import * as dotenv from 'dotenv';

import { APR_2023_TIMESTAMP, getAmms, PROJECT_ID, sleep } from '../common';
import { sync } from './sync';

dotenv.config();

let previousBlockNumber = 0;

export const run = async (chainIds: number[]) => {
  // authenticate to GCloud
  // await authenticateImplicitWithAdc();

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
      console.log('Processing mints and burns');
      await sync(bigQuery, amms);
    } catch (error) {
      console.log(`Loop has failed with message: ${(error as Error).message}.`);
      await sleep(60 * 1000); // sleep 60s
    }
  }
};
