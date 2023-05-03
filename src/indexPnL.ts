import { createPositionsTable } from './big-query-support/positions-table/createPositionsTable';
import { sleep } from './common/utils';
import { authenticateImplicitWithAdc, chainIds, indexInactiveTimeInMS } from './global';
import { syncPnL } from './pnl/syncPnL';

export const main = async () => {
  await authenticateImplicitWithAdc();
  await createPositionsTable();

  while (true) {
    try {
      await syncPnL(chainIds);
    } catch (error) {
      console.log(
        `[PnL]: Loop has failed with message: ${(error as Error).message}.  It will retry...`,
      );
    }

    await sleep(indexInactiveTimeInMS);
  }
};

main()
  .then(() => {
    console.log('[PnL]: Execution completed.');
  })
  .catch((error) => {
    console.log(`[PnL]: Error encountered. ${(error as unknown as Error).message}`);
  });
