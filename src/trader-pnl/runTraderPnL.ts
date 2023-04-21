import { createPositionsTable } from '../big-query-support/manage-tables/positions-table';
import { POSITIONS_TABLE_NAME } from '../common/constants';
import { syncTraderPnL } from './syncTraderPnL';

export const runTraderPnL = async (chainIds: number[]) => {
  await createPositionsTable(POSITIONS_TABLE_NAME);

  while (true) {
    try {
      await syncTraderPnL(chainIds);
    } catch (error) {
      console.log(
        `[Trader PnL]: Loop has failed with message: ${(error as Error).message}. It will retry...`,
      );
    }
  }
};
