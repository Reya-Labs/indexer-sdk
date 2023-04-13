import { BigQuery } from '@google-cloud/bigquery';
import * as dotenv from 'dotenv';

import { APR_2023_TIMESTAMP, getAmms, LP_PROCESSING_WINDOW, PROJECT_ID, sleep } from '../common';
import { syncMints } from './syncMints';
import { syncPassiveSwaps } from './syncPassiveSwaps';

dotenv.config();

let previousBlockNumber = 0;

export const run = async (chainId: number) => {
  // authenticate to GCloud
  // await authenticateImplicitWithAdc();

  // retrieve BigQuery object for the given project
  const bigQuery = new BigQuery({
    projectId: PROJECT_ID,
  });

  // Clear testing db -- todo: to be removed for prod
  const options = {
    query: `DELETE FROM \`risk-monitoring-361911.voltz_v1_positions.Voltz V1 Positions Staging LP\` WHERE chainId=${chainId}`,
    timeoutMs: 100000,
    useLegacySql: false,
  };

  await bigQuery.query(options);

  // fetch AMMs
  const amms = await getAmms(chainId, APR_2023_TIMESTAMP);

  if (amms.length === 0) {
    console.log('Skipping processing because the list of AMMs is empty.');
    return;
  }

  // get provider from the first amm
  const provider = amms[0].provider;

  // get min processing interval
  const minBlockInterval = LP_PROCESSING_WINDOW[chainId];

  while (true) {
    const currentBlockNumber = await provider.getBlockNumber();

    if (previousBlockNumber >= currentBlockNumber) {
      console.log('Block has not changed. Sleeping...');
      await sleep(60 * 1000); // sleep 60s
      continue;
    }

    console.log(`Processing blocks: ${previousBlockNumber}-${currentBlockNumber}`);

    try {
      console.log('Processing mints...');
      await syncMints(chainId, bigQuery, amms, previousBlockNumber, currentBlockNumber);

      console.log('Processing passive swaps...');
      await syncPassiveSwaps(
        chainId,
        bigQuery,
        amms,
        previousBlockNumber,
        currentBlockNumber,
        minBlockInterval,
      );

      previousBlockNumber = currentBlockNumber + 1;
    } catch (error) {
      console.log(`Loop has failed with message: ${(error as Error).message}.`);
      await sleep(60 * 1000); // sleep 60s
    }
  }
};
