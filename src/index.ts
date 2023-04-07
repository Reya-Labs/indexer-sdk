import { Storage } from '@google-cloud/storage';

import { PROJECT_ID } from './common';
import { run } from './trader-pnl/run';

async function authenticateImplicitWithAdc() {
  const storage = new Storage({
    projectId: PROJECT_ID,
  });

  await storage.getBuckets();
};

const main = async () => {
  await authenticateImplicitWithAdc();
  await run();
}

main().catch(() => {
  console.log('Execution completed.');
});
