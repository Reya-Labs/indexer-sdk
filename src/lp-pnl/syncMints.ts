import { BigQuery } from '@google-cloud/bigquery';
import { AMM } from '@voltz-protocol/v1-sdk';

import { getPreviousMintEvents } from '../common/mints/getPreviousMintEvents';
import { processMintEvent } from './processMintEvent';

export const syncMints = async (
  bigQuery: BigQuery,
  amms: AMM[],
  previousBlockNumber: number,
): Promise<number> => {
  const previousMintEvents = await getPreviousMintEvents(amms, previousBlockNumber);

  let counter = 0;

  const promises = Object.values(previousMintEvents).map(async ({ amm, mintEvents }) => {
    const sortedSwapEvents = mintEvents.sort((a, b) => {
      if (a.blockNumber === b.blockNumber) {
        return a.transactionIndex - b.transactionIndex;
      }

      return a.blockNumber - b.blockNumber;
    });

    for (const swapEvent of sortedSwapEvents) {
      await processMintEvent(bigQuery, amm, swapEvent);
      counter++;
    }
  });

  const output = await Promise.allSettled(promises);
  output.forEach((v) => {
    if (v.status === 'rejected') {
      throw v.reason;
    }
  });

  return counter;
};
