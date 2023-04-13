import { Storage } from '@google-cloud/storage';

import { PROJECT_ID } from './common';
// import { run as runLPs } from './lp-pnl/run';
// import { run as runTraders } from './trader-pnl/run';
import { run as runMintsAndBurns } from './mints-and-burns/run';

// todo: will need to adjust this script to enable execution for both lps and traders
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
