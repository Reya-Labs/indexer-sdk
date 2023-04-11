import { BigQuery } from '@google-cloud/bigquery';
import * as dotenv from 'dotenv';

import { APR_2023_TIMESTAMP, CHAIN_ID, getAmms, PROJECT_ID, sleep } from '../common';
import { syncMints } from './syncMints';
import { syncPassiveSwaps } from './syncPassiveSwaps';

dotenv.config();

let previousBlockNumberMints = 0;
let previousBlockNumberPassiveSwaps = 0;

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

  while (true) {

    // syncing mints

    const currentBlockNumber = await provider.getBlockNumber();

    if (previousBlockNumberMints === currentBlockNumber) {
      console.log('Block has not changed. Sleeping...');
      await sleep(60 * 1000); // sleep 60s
      continue;
    }

    console.log(`Processing blocks: ${previousBlockNumberMints}-${currentBlockNumber}`);

    try {
      await syncMints(bigQuery, amms, previousBlockNumberMints);
      previousBlockNumberMints = currentBlockNumber;
    } catch (error) {
      console.log(`Loop has failed with message: ${(error as Error).message}.`);
      await sleep(60 * 1000); // sleep 60s
    }

    /*
    syncing passive swaps

    note, we do not change the block number by calling await provider.getBlockNumber() again in here
    because there's no point processing passive swaps for a block that's beyond 
    the latest synced block that processes mints
    to make sure we don't miss any lps when generating passive swap events
    */
    
    if (previousBlockNumberPassiveSwaps === currentBlockNumber) {
      console.log('Block has not changed. Sleeping...');
      await sleep(60 * 1000); // sleep 60s
      continue;
    }

    console.log(`Processing blocks: ${previousBlockNumberPassiveSwaps}-${currentBlockNumber}`);

    try {
      await syncPassiveSwaps(bigQuery, amms, previousBlockNumberPassiveSwaps);
      previousBlockNumberPassiveSwaps = currentBlockNumber;
    } catch (error) {
      console.log(`Loop has failed with message: ${(error as Error).message}.`);
      await sleep(60 * 1000); // sleep 60s
    }

  }
};
