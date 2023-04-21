import { Storage } from '@google-cloud/storage';

import { PROJECT_ID } from './common/constants';
import { runLPPnL } from './lp-pnl/runLPPnL';
import { runMintsAndBurns } from './mints-and-burns/runMintsAndBurns';
import { runSwaps } from './swaps/runSwaps';
import { runTraderPnL } from './trader-pnl/runTraderPnL';

async function authenticateImplicitWithAdc() {
  const storage = new Storage({
    projectId: PROJECT_ID,
  });

  await storage.getBuckets();
}

// const chainIds = [1];
const chainIds = [1, 42161];

const main = async () => {
  await authenticateImplicitWithAdc();

  let promises: Promise<void>[] = [];

  // promises = promises.concat(runSwaps(chainIds));
  // promises = promises.concat(runMintsAndBurns(chainIds));
  // promises = promises.concat(runTraderPnL(chainIds));
  promises = promises.concat(runLPPnL(chainIds));

  await Promise.allSettled(promises);
};

main()
  .then(() => {
    console.log('Execution completed.');
  })
  .catch((error) => {
    console.log(`Error encountered. ${(error as unknown as Error).message}`);
  });
