import { createActiveSwapsTable } from './big-query-support/active-swaps-table/createActiveSwapsTable';
import { sleep } from './common/utils';
import { authenticateImplicitWithAdc, chainIds, indexInactiveTimeInMS } from './global';
import { syncSwaps } from './swaps/syncSwaps';

export const main = async () => {
  await authenticateImplicitWithAdc();
  await createActiveSwapsTable();

  while (true) {
    try {
      await syncSwaps(chainIds);
    } catch (error) {
      console.log(
        `[Swaps]: Loop has failed with message: ${(error as Error).message}.  It will retry...`,
      );
    }

    await sleep(indexInactiveTimeInMS);
  }
};

main()
  .then(() => {
    console.log('[Swaps]: Execution completed.');
  })
  .catch((error) => {
    console.log(`[Swaps]: Error encountered. ${(error as unknown as Error).message}`);
  });
