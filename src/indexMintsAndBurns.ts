import { createMintsAndBurnsTable } from './big-query-support/mints-and-burns-table/createMintsAndBurnsTable';
import { sleep } from './common/utils';
import { authenticateImplicitWithAdc, chainIds, indexInactiveTimeInMS } from './global';
import { syncMintsAndBurns } from './mints-and-burns/syncMintsAndBurns';

export const main = async () => {
  await authenticateImplicitWithAdc();
  await createMintsAndBurnsTable();

  while (true) {
    try {
      await syncMintsAndBurns(chainIds);
    } catch (error) {
      console.log(
        `[Mints and burns]: Loop has failed with message: ${
          (error as Error).message
        }.  It will retry...`,
      );
    }

    await sleep(indexInactiveTimeInMS);
  }
};

main()
  .then(() => {
    console.log('[Mints and burns]: Execution completed.');
  })
  .catch((error) => {
    console.log(`[Mints and burns]: Error encountered. ${(error as unknown as Error).message}`);
  });
