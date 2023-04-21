import { createActiveSwapsTable } from './big-query-support/manage-tables/active-swaps-table';
import { ACTIVE_SWAPS_TABLE_NAME } from './common/constants';
import { authenticateImplicitWithAdc, chainIds } from './global';
import { syncSwaps } from './swaps/syncSwaps';

export const main = async () => {
  await authenticateImplicitWithAdc();
  await createActiveSwapsTable(ACTIVE_SWAPS_TABLE_NAME);

  while (true) {
    try {
      await syncSwaps(chainIds);
    } catch (error) {
      console.log(
        `[Swaps]: Loop has failed with message: ${(error as Error).message}.  It will retry...`,
      );
    }
  }
};

main()
  .then(() => {
    console.log('[Swaps]: Execution completed.');
  })
  .catch((error) => {
    console.log(`[Swaps]: Error encountered. ${(error as unknown as Error).message}`);
  });