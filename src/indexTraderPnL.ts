
import { createPositionsTable } from './big-query-support/manage-tables/positions-table';
import { POSITIONS_TABLE_NAME } from './common/constants';
import { authenticateImplicitWithAdc, chainIds } from './global';
import { syncTraderPnL } from './trader-pnl/syncTraderPnL';

export const main = async () => {
  await authenticateImplicitWithAdc();
  await createPositionsTable(POSITIONS_TABLE_NAME);

  while (true) {
    try {
      await syncTraderPnL(chainIds);
    } catch (error) {
      console.log(
        `[Trader PnL]: Loop has failed with message: ${(error as Error).message}.  It will retry...`,
      );
    }
  }
};

main()
  .then(() => {
    console.log('[Trader PnL]: Execution completed.');
  })
  .catch((error) => {
    console.log(`[Trader PnL]: Error encountered. ${(error as unknown as Error).message}`);
  });