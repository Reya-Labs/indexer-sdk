import { BigQuery } from '@google-cloud/bigquery';
import * as dotenv from 'dotenv';

import { APR_2023_TIMESTAMP, getAmms, PROJECT_ID } from '../common';
import { syncMints } from './syncMints';
import { syncPassiveSwaps } from './syncPassiveSwaps';
import { AMM } from '@voltz-protocol/v1-sdk';

dotenv.config();

export const run = async (chainIds: number[]) => {

  // retrieve BigQuery object for the given project
  const bigQuery = new BigQuery({
    projectId: PROJECT_ID,
  });

  const tableId = 

  // fetch AMMs
  const amms: AMM[] = await getAmms(chainIds, APR_2023_TIMESTAMP);

  if (amms.length === 0) {
    console.log('Skipping processing because the list of AMMs is empty.');
    return;
  }

  while (true) {
    await syncMints(bigQuery, amms);
    await syncPassiveSwaps(bigQuery, amms);
  }

  
};
