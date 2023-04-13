import { BigQuery } from '@google-cloud/bigquery';
import { AMM } from '@voltz-protocol/v1-sdk';

import { getLastProcessedBlock, setLastProcessedBlock } from '../big-query-support';
import { getPreviousEvents, isTestingAccount } from '../common';
import { processSwapEvent } from './processSwapEvent';

export const syncActiveSwaps = async (
  chainId: number,
  bigQuery: BigQuery,
  amms: AMM[],
  toBlock: number,
): Promise<void> => {
  const promises = amms.map(async (amm) => {
    const processId = `active_swap_sync_${chainId}_${amm.id}`;
    const lastProcessedBlock = await getLastProcessedBlock(bigQuery, processId);

    const events = (await getPreviousEvents(amm, 'swap', lastProcessedBlock + 1, toBlock)).filter(
      (swapEvent) => isTestingAccount(swapEvent.args?.recipient as string),
    );

    console.log(
      `Processing ${events.length} active swaps for AMM ${amm.id} between blocks: ${
        lastProcessedBlock + 1
      }-${toBlock}...`,
    );

    for (let i = 0; i < events.length; i++) {
      const swapEvent = events[i];

      await processSwapEvent(chainId, bigQuery, amm, swapEvent);

      if (i + 1 === events.length) {
        await setLastProcessedBlock(bigQuery, processId, swapEvent.blockNumber);
      }
    }
  });

  const output = await Promise.allSettled(promises);
  output.forEach((v) => {
    if (v.status === 'rejected') {
      throw v.reason;
    }
  });
};
