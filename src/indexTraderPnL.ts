import { createPositionsTable } from './big-query-support/positions-table/createPositionsTable';
import { sleep } from './common/utils';
import { authenticateImplicitWithAdc, chainIds, indexInactiveTimeInMS } from './global';
import { syncTraderPnL } from './trader-pnl/syncTraderPnL';

export const main = async () => {
  await authenticateImplicitWithAdc();
  await createPositionsTable();

  while (true) {
    try {
      await syncTraderPnL(chainIds);
    } catch (error) {
      console.log(
        `[Trader PnL]: Loop has failed with message: ${
          (error as Error).message
        }.  It will retry...`,
      );
    }

    await sleep(indexInactiveTimeInMS);
  }
};

main()
  .then(() => {
    console.log('[Trader PnL]: Execution completed.');
  })
  .catch((error) => {
    console.log(`[Trader PnL]: Error encountered. ${(error as unknown as Error).message}`);
  });
