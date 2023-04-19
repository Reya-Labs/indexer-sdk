import { Storage } from '@google-cloud/storage';

import { PROJECT_ID } from './common/constants';
import { getRedisClient } from './common/services/redisService';
import { run as runLpsSpeed } from './lp-pnl-speed/run';
// import { run as runMintsAndBurns } from './mints-and-burns/run';
// import { run as runTraders } from './trader-pnl/run';

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

  const redisClient = getRedisClient();

  // promises = promises.concat(runMintsAndBurns(chainIds, redisClient));
  // promises = promises.concat(runTraders(chainIds, redisClient));
  promises = promises.concat(runLpsSpeed(chainIds, redisClient));

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
