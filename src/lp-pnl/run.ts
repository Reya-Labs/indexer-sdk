import { BigQuery } from '@google-cloud/bigquery';
import * as dotenv from 'dotenv';

import { APR_2023_TIMESTAMP, getAmms, LP_PROCESSING_WINDOW, PROJECT_ID, sleep } from '../common';
import { syncMints } from './syncMints';
import { syncPassiveSwaps } from './syncPassiveSwaps';

dotenv.config();

export const run = async (chainId: number) => {
  // retrieve BigQuery object for the given project
  const bigQuery = new BigQuery({
    projectId: PROJECT_ID,
  });

  // fetch AMMs
  const amms = await getAmms(chainId, APR_2023_TIMESTAMP);

  if (amms.length === 0) {
    console.log('Skipping processing because the list of AMMs is empty...');
    return;
  }

  // get provider from the first amm
  const provider = amms[0].provider;

  // get min processing interval
  const minBlockInterval = LP_PROCESSING_WINDOW[chainId];

  while (true) {
    const currentBlockNumber = await provider.getBlockNumber();

    try {
      await syncMints(chainId, bigQuery, amms, currentBlockNumber);

      await syncPassiveSwaps(chainId, bigQuery, amms, currentBlockNumber, minBlockInterval);
    } catch (error) {
      console.log(`Loop has failed with message: ${(error as Error).message}. It will retry...`);
    }

    console.log();
    console.log(`Finished one LP run for chain id ${chainId}. Sleeping for 60s...`);
    await sleep(60 * 1000); // sleep 60s
    console.log();
  }
};
