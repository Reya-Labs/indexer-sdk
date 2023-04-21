import { createPositionsTable } from '../big-query-support/manage-tables/positions-table';
import { POSITIONS_TABLE_NAME } from '../common/constants';
import { syncLPPnL } from './syncLPPnL';

export const runLPPnL = async (chainIds: number[]) => {
  await createPositionsTable(POSITIONS_TABLE_NAME);

  while (true) {
    try {
      console.log('[LP PnL]: New syncing starts...');

      await syncLPPnL(chainIds);
    } catch (error) {
      console.log(
        `[LP PnL]: Loop has failed with message: ${(error as Error).message}. It will retry...`,
      );
    }
  }
};
