import { BigQuery } from '@google-cloud/bigquery';
import { AMM } from '@voltz-protocol/v1-sdk';

import { getPreviousEvents } from '../common';
import { processPassiveSwapEvents } from './processPassiveSwapEvents';
import { LP_PROCESSING_WINDOW, sleep } from '../common';

export const syncPassiveSwaps = async (
  bigQuery: BigQuery,
  amms: AMM[]
): Promise<void> => {

    // // get min processing interval
    // const minBlockInterval = LP_PROCESSING_WINDOW[chainId];

    // while (true) {
    //   const currentBlockNumber = await provider.getBlockNumber();
  
    //   if (previousBlockNumber === currentBlockNumber) {
    //     console.log('Block has not changed. Sleeping...');
    //     await sleep(60 * 1000); // sleep 60s
    //     continue;
    //   }
  
    //   console.log(`Processing blocks: ${previousBlockNumber}-${currentBlockNumber}`);
  
    //   try {
    //     console.log('Processing mints...');
    //     await syncMints(chainId, bigQuery, amms, previousBlockNumber, currentBlockNumber);
  
    //     console.log('Processing passive swaps...');
    //     await syncPassiveSwaps(
    //       chainId,
    //       bigQuery,
    //       amms,
    //       previousBlockNumber,
    //       currentBlockNumber,
    //       minBlockInterval,
    //     );
  
    //     previousBlockNumber = currentBlockNumber + 1;
    //   } catch (error) {
    //     console.log(`Loop has failed with message: ${(error as Error).message}.`);
    //     await sleep(60 * 1000); // sleep 60s
    //   }
    // }

  const previousSwapEvents = await getPreviousEvents(amms, ['swap']);

  const promises = Object.values(previousSwapEvents).map(async ({ events }) => {

    for (let i = 0; i < events.length; i++) {
      const event = events[i];

      await processPassiveSwapEvents({
        bigQuery,
        event,
      });
      
    }
  });

  const output = await Promise.allSettled(promises);
  output.forEach((v) => {
    if (v.status === 'rejected') {
      throw v.reason;
    }
  });
};
