import { BigQuery } from '@google-cloud/bigquery';
import { Storage } from '@google-cloud/storage';

import { PROJECT_ID } from './common';
import { run as runLPs } from './lp-pnl/run';
import { run as runTraders } from './trader-pnl/run';

// todo: will need to adjust this script to enable execution for both lps and traders
async function authenticateImplicitWithAdc() {
  const storage = new Storage({
    projectId: PROJECT_ID,
  });

  await storage.getBuckets();
}

// const chainIds = [42161];
const chainIds = [1, 42161];

const main = async () => {
  await authenticateImplicitWithAdc();

  const bigQuery = new BigQuery({
    projectId: PROJECT_ID,
  });

  // Clear testing db -- todo: to be removed for prod
  {
    const options = {
      query: `DELETE FROM \`risk-monitoring-361911.voltz_v1_positions.Voltz V1 Positions Staging LP\` WHERE true`,
      timeoutMs: 100000,
      useLegacySql: false,
    };

    await bigQuery.query(options);
  }

  {
    const options = {
      query: `DELETE FROM \`risk-monitoring-361911.voltz_v1_positions.Voltz V1 Active Swaps Staging LP\` WHERE true`,
      timeoutMs: 100000,
      useLegacySql: false,
    };

    await bigQuery.query(options);
  }

  {
    const options = {
      query: `DELETE FROM \`risk-monitoring-361911.voltz_v1_positions.Last Processed Blocks\` WHERE true`,
      timeoutMs: 100000,
      useLegacySql: false,
    };

    await bigQuery.query(options);
  }
  //

  let promises: Promise<void>[] = [];
  promises = promises.concat(chainIds.map((chainId) => runTraders(chainId)));
  promises = promises.concat(chainIds.map((chainId) => runLPs(chainId)));

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
