import { createPositionsTable } from '../big-query-support/manage-tables/positions-table';
import { POSITIONS_TABLE_NAME } from '../common/constants';
import { sync } from './sync';

export const run = async (chainIds: number[]) => {
  await createPositionsTable(POSITIONS_TABLE_NAME);

  while (true) {
    try {
      await sync(chainIds);
    } catch (error) {
      console.log(`Loop has failed with message: ${(error as Error).message}. It will retry...`);
    }
  }
};
