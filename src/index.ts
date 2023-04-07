/* eslint-disable */
import { BigQuery } from '@google-cloud/bigquery';
import { getAmms } from './common/getAmmsAndVammAddresses';
import { sync } from './trader-pnl/sync';
import { PROJECT_ID } from './common/constants';
import * as dotenv from "dotenv";
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
  console.log("Buckets:");

  for (const bucket of buckets) {
    console.log(bucket.name);
  }

  console.log("Listed all storage buckets.");
}

export const main = async () => {
  await authenticateImplicitWithAdc();
  const bigQuery = new BigQuery({
    projectId: PROJECT_ID,
  });

  const amms = await getAmms(CHAIN_ID, APR_2023_TIMESTAMP);
  const provider = amms[0].provider;

  const historicalSwapsCounter = await sync(bigQuery, provider, amms);

  console.log("historicalSwapsCounter:", historicalSwapsCounter);

  console.log(`Successfully processed ${historicalSwapsCounter} historical events`);

  return 'hello';
};

main();
