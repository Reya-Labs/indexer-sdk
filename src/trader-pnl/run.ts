import { BigQuery } from '@google-cloud/bigquery';
import * as dotenv from 'dotenv';

import { APR_2023_TIMESTAMP, getAmms, PROJECT_ID, sleep } from '../common';
import { syncActiveSwaps } from './synActiveSwaps';

dotenv.config();

export const run = async (chainId: number) => {
  // authenticate to GCloud
  // await authenticateImplicitWithAdc();

  // retrieve BigQuery object for the given project
  const bigQuery = new BigQuery({
    projectId: PROJECT_ID,
  });

  // fetch AMMs
  const amms = await getAmms(chainId, APR_2023_TIMESTAMP);

  if (amms.length === 0) {
    console.log('Skipping processing because the list of AMMs is empty.');
    return;
  }

  // get provider from the first amm
  const provider = amms[0].provider;

  while (true) {
    const currentBlockNumber = await provider.getBlockNumber();

    try {
      await syncActiveSwaps(chainId, bigQuery, amms, currentBlockNumber);
    } catch (error) {
      console.log(`Loop has failed with message: ${(error as Error).message}.`);
    }

    console.log();
    console.log(`Finished one Trader run for chain id ${chainId}. Sleeping for 60s...`);
    await sleep(60 * 1000); // sleep 60s
    console.log();
  }
};
