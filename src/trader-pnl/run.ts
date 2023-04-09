import { BigQuery } from '@google-cloud/bigquery';
import * as dotenv from 'dotenv';

import { APR_2023_TIMESTAMP, CHAIN_ID, getAmms, PROJECT_ID } from '../common';
import { sync } from './sync';

dotenv.config();

export const run = async () => {
  // authenticate to GCloud
  // await authenticateImplicitWithAdc();

  // retrieve BigQuery object for the given project
  const bigQuery = new BigQuery({
    projectId: PROJECT_ID,
  });

  // fetch AMMs
  const amms = await getAmms(CHAIN_ID, APR_2023_TIMESTAMP);

  if (amms.length === 0) {
    console.log('Skipping processing because the list of AMMs is empty.');
    return;
  }

  // get provider from the first amm
  const provider = amms[0].provider;

  // process all historical swaps
  const historicalSwapsCounter = await sync(bigQuery, provider, amms);

  console.log(`Successfully processed ${historicalSwapsCounter} historical events`);

  return 'hello';
};
