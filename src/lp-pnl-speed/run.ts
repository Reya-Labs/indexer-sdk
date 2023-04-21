import { createPositionsTable } from '../big-query-support/manage-tables/positions-table';
import { POSITIONS_TABLE_NAME } from '../common/constants';
import { syncPassiveSwaps } from './syncPassiveSwaps';

export const run = async (chainIds: number[]) => {
  await createPositionsTable(POSITIONS_TABLE_NAME);

  while (true) {
    try {
      await syncPassiveSwaps(chainIds);
    } catch (error) {
      console.log(
        `[Passive swaps]: Loop has failed with message: ${
          (error as Error).message
        }. It will retry...`,
      );
    }
  }
};
