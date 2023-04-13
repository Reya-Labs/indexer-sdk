import * as dotenv from 'dotenv';

dotenv.config();

import { Storage } from '@google-cloud/storage';

import { PROJECT_ID } from '../common';
import { app } from './app';

async function authenticateImplicitWithAdc() {
  const storage = new Storage({
    projectId: PROJECT_ID,
  });

  await storage.getBuckets();
}

const main = async () => {
  await authenticateImplicitWithAdc();

  const PORT = process.env.PORT || 8080;
  console.log('PORT:', PORT);
  app.listen(PORT, () => {console.log('Listening...')});
};

main()
  .then(() => {
    console.log('Execution completed.');
  })
  .catch((error) => {
    console.log(`Error encountered. ${(error as unknown as Error).message}`);
  });
