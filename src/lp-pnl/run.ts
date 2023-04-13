import { BigQuery } from '@google-cloud/bigquery';
import * as dotenv from 'dotenv';

import { APR_2023_TIMESTAMP, getAmms, LP_PROCESSING_WINDOW, PROJECT_ID, sleep } from '../common';
import { syncMints } from './syncMints';
import { syncPassiveSwaps } from './syncPassiveSwaps';
import { AMM } from '@voltz-protocol/v1-sdk';

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
  const amms: AMM[] = await getAmms(chainIds, APR_2023_TIMESTAMP);

  if (amms.length === 0) {
    console.log('Skipping processing because the list of AMMs is empty.');
    return;
  }

  while (true) {
    await syncPassiveSwaps(bigQuery, amms);
  }

  

};
