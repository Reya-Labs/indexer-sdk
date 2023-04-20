import { createActiveSwapsTable } from '../big-query-support/manage-tables/active-swaps-table';
import { ACTIVE_SWAPS_TABLE_NAME } from '../common/constants';
import { syncSwaps } from './syncSwaps';

export const run = async (chainIds: number[]) => {
  await createActiveSwapsTable(ACTIVE_SWAPS_TABLE_NAME);

  while (true) {
    try {
      await syncSwaps(chainIds);
    } catch (error) {
      console.log(`Loop has failed with message: ${(error as Error).message}.  It will retry...`);
    }
  }
};
