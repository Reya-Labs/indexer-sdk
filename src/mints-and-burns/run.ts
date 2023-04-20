import { createMintsAndBurnsTable } from '../big-query-support/manage-tables/mints-and-burns-table';
import { MINTS_BURNS_TABLE_NAME } from '../common/constants';
import { syncMintsAndBurns } from './syncMintsAndBurns';

export const run = async (chainIds: number[]) => {
  await createMintsAndBurnsTable(MINTS_BURNS_TABLE_NAME);

  while (true) {
    try {
      await syncMintsAndBurns(chainIds);
    } catch (error) {
      console.log(`Loop has failed with message: ${(error as Error).message}.  It will retry...`);
    }
  }
};
