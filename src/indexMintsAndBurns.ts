import { createMintsAndBurnsTable } from './big-query-support/manage-tables/mints-and-burns-table';
import { MINTS_BURNS_TABLE_NAME } from './common/constants';
import { authenticateImplicitWithAdc, chainIds } from './global';
import { syncMintsAndBurns } from './mints-and-burns/syncMintsAndBurns';

export const main = async () => {
  await authenticateImplicitWithAdc();
  await createMintsAndBurnsTable(MINTS_BURNS_TABLE_NAME);

  while (true) {
    try {
      await syncMintsAndBurns(chainIds);
    } catch (error) {
      console.log(
        `[Mints and burns]: Loop has failed with message: ${(error as Error).message}.  It will retry...`,
      );
    }
  }
};

main()
  .then(() => {
    console.log('[Mints and burns]: Execution completed.');
  })
  .catch((error) => {
    console.log(`[Mints and burns]: Error encountered. ${(error as unknown as Error).message}`);
  });