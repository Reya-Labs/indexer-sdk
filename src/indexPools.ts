import { createPoolsTable } from './big-query-support/pools-table/createPoolsTable';
import { sleep } from './common/utils';
import { authenticateImplicitWithAdc, chainIds, indexInactiveTimeInMS } from './global';
import { syncPools } from './pools/syncPools';

export const main = async () => {
  await authenticateImplicitWithAdc();
  await createPoolsTable();

  while (true) {
    try {
      await syncPools(chainIds);
    } catch (error) {
      console.log(
        `[Pools]: Loop has failed with message: ${(error as Error).message}.  It will retry...`,
      );
    }

    await sleep(indexInactiveTimeInMS);
  }
};

main()
  .then(() => {
    console.log('[Pools]: Execution completed.');
  })
  .catch((error) => {
    console.log(`[Pools]: Error encountered. ${(error as unknown as Error).message}`);
  });
