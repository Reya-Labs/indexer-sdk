import { createActiveSwapsTable } from '../big-query-support/manage-tables/active-swaps-table';
import { ACTIVE_SWAPS_TABLE_NAME } from '../common/constants';
import { syncActiveSwaps } from './syncActiveSwaps';

export const run = async (chainIds: number[]) => {
  await createActiveSwapsTable(ACTIVE_SWAPS_TABLE_NAME);

  while (true) {
    try {
      await syncActiveSwaps(chainIds);
    } catch (error) {
      console.log(
        `[Active swaps]: Loop has failed with message: ${
          (error as Error).message
        }. It will retry...`,
      );
    }
  }
};
