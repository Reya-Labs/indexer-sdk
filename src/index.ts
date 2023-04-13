import { Storage } from '@google-cloud/storage';

import { PROJECT_ID, REDISHOST, REDISPORT } from './common';
import { run as runLPs } from './lp-pnl/run';
import { run as runMintsAndBurns } from './mints-and-burns/run';
import { run as runTraders } from './trader-pnl/run';

import { Redis } from 'ioredis';
const redis = new Redis(REDISPORT, REDISHOST);
let redisConnected = false;

redis.on('connect', () => {
  console.log('successfully connected to redis');
  redisConnected = true;
}); 


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

  if (redisConnected) { 
    promises = promises.concat(runMintsAndBurns(chainIds, redis));
    promises = promises.concat(runTraders(chainIds, redis));
    promises = promises.concat(runLPs(chainIds, redis));
  } else { 
    promises = promises.concat(runMintsAndBurns(chainIds));
    promises = promises.concat(runTraders(chainIds));
    promises = promises.concat(runLPs(chainIds));
  }

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
