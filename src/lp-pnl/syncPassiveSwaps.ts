import { BigQuery } from '@google-cloud/bigquery';
import { AMM } from '@voltz-protocol/v1-sdk';

import { getLastProcessedBlock, setLastProcessedBlock } from '../big-query-support';
import { getPreviousEvents } from '../common';
import { processPassiveSwapEvents } from './processPassiveSwapEvents';

export const syncPassiveSwaps = async (
  chainId: number,
  bigQuery: BigQuery,
  amms: AMM[],
  toBlock: number,
  minBlockInterval: number,
): Promise<void> => {
  const promises = amms.map(async (amm) => {
    const processId = `passive_swap_sync_${chainId}_${amm.id}`;
    let lastProcessedBlock = await getLastProcessedBlock(bigQuery, processId);

    const events = await getPreviousEvents(amm, 'swap', lastProcessedBlock + 1, toBlock);

    if (events.length === 0) {
      return;
    }

    console.log(
      `Processing passive swaps for AMM ${amm.id} between blocks: ${
        lastProcessedBlock + 1
      }-${toBlock}...`,
    );

    for (const event of events) {
      if (event.blockNumber >= lastProcessedBlock + minBlockInterval) {
        await processPassiveSwapEvents({
          bigQuery,
          amm,
          event,
          chainId,
        });

        lastProcessedBlock = event.blockNumber;
      }
    }

    await setLastProcessedBlock(bigQuery, processId, lastProcessedBlock);
  });

  const output = await Promise.allSettled(promises);
  output.forEach((v) => {
    if (v.status === 'rejected') {
      throw v.reason;
    }
  });
};
