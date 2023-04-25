import { createPositionsTable } from './big-query-support/positions-table/createPositionsTable';
import { sleep } from './common/utils';
import { authenticateImplicitWithAdc, chainIds, indexInactiveTimeInMS } from './global';
import { syncLPPnL } from './lp-pnl/syncLPPnL';

export const main = async () => {
  await authenticateImplicitWithAdc();
  await createPositionsTable();

  while (true) {
    try {
      await syncLPPnL(chainIds);
    } catch (error) {
      console.log(
        `[LP PnL]: Loop has failed with message: ${(error as Error).message}.  It will retry...`,
      );
    }

    await sleep(indexInactiveTimeInMS);
  }
};

main()
  .then(() => {
    console.log('[LP PnL]: Execution completed.');
  })
  .catch((error) => {
    console.log(`[LP PnL]: Error encountered. ${(error as unknown as Error).message}`);
  });
