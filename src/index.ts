import { Storage } from '@google-cloud/storage';

import { PROJECT_ID } from './common';
import { run } from './trader-pnl/run';

// todo: will need to adjust this script to enable execution for both lps and traders
async function authenticateImplicitWithAdc() {
  const storage = new Storage({
    projectId: PROJECT_ID,
  });

  await storage.getBuckets();
}

const main = async () => {
  await authenticateImplicitWithAdc();
  await run(1);
};

main()
  .then(() => {
    console.log('Execution completed.');
  })
  .catch((error) => {
    console.log(`Error encountered. ${(error as unknown as Error).message}`);
  });
