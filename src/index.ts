import { Storage } from '@google-cloud/storage';

import { PROJECT_ID } from './common/constants';
import { run as runLpsSpeed } from './lp-pnl-speed/run';

async function authenticateImplicitWithAdc() {
  const storage = new Storage({
    projectId: PROJECT_ID,
  });

  await storage.getBuckets();
}

const chainIds = [1];
// const chainIds = [1, 42161];

const main = async () => {
  await authenticateImplicitWithAdc();

  let promises: Promise<void>[] = [];

  // promises = promises.concat(runMintsAndBurns(chainIds));
  // promises = promises.concat(runTraders(chainIds));
  promises = promises.concat(runLpsSpeed(chainIds));

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
