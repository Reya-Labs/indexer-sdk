/* eslint-disable */
import { BigQuery } from '@google-cloud/bigquery';
import { getAmms } from './common';
import { sync } from './trader-pnl/sync';
import { PROJECT_ID } from './common';
import * as dotenv from 'dotenv';
import { Storage } from '@google-cloud/storage';

dotenv.config();

const CHAIN_ID = 1;
const APR_2023_TIMESTAMP = 1680337863;

// only for local testing
async function authenticateImplicitWithAdc() {
  const storage = new Storage({
    projectId: PROJECT_ID,
  });

  const [buckets] = await storage.getBuckets();
  console.log('Buckets:');

  for (const bucket of buckets) {
    console.log(bucket.name);
  }

  console.log('Listed all storage buckets.');
}

export const main = async () => {
  // authenticate to GCloud
  await authenticateImplicitWithAdc();

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

  console.log('historicalSwapsCounter:', historicalSwapsCounter);

  console.log(`Successfully processed ${historicalSwapsCounter} historical events`);

  return 'hello';
};

main();
