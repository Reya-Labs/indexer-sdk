import { Storage } from '@google-cloud/storage';

import { PROJECT_ID } from './common';
import { runMints } from './lp-pnl/runMints';
import { runPassiveSwaps } from './lp-pnl/runPassiveSwaps';
import { run as runMintsAndBurns } from './mints-and-burns/run';
import { run as runTraders } from './trader-pnl/run';

async function authenticateImplicitWithAdc() {
  const storage = new Storage({
    projectId: PROJECT_ID,
  });

  await storage.getBuckets();
}

const chainIds = [1, 42161];

const main = async () => {
  await authenticateImplicitWithAdc();

  let promises: Promise<void>[] = [];

  promises = promises.concat(runMintsAndBurns(chainIds));
  promises = promises.concat(runTraders(chainIds));
  promises = promises.concat(runMints(chainIds));
  promises = promises.concat(runPassiveSwaps(chainIds));

  console.log(`Number of parallel calls ${promises.length}`);

  await Promise.allSettled(promises);
};

main()
  .then(() => {
    console.log('Execution completed.');
  })
  .catch((error) => {
    console.log(`Error encountered. ${(error as unknown as Error).message}`);
  });
