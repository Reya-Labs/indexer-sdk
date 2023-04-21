import { createPositionsTable } from './big-query-support/manage-tables/positions-table';
import { POSITIONS_TABLE_NAME } from './common/constants';
import { authenticateImplicitWithAdc, chainIds } from './global';
import { syncLPPnL } from './lp-pnl/syncLPPnL';

export const main = async () => {
  await authenticateImplicitWithAdc();
  await createPositionsTable(POSITIONS_TABLE_NAME);

  while (true) {
    try {
      await syncLPPnL(chainIds);
    } catch (error) {
      console.log(
        `[LP PnL]: Loop has failed with message: ${(error as Error).message}.  It will retry...`,
      );
    }
  }
};

main()
  .then(() => {
    console.log('[LP PnL]: Execution completed.');
  })
  .catch((error) => {
    console.log(`[LP PnL]: Error encountered. ${(error as unknown as Error).message}`);
  });
