import { BigQuery } from '@google-cloud/bigquery';
import { AMM } from '@voltz-protocol/v1-sdk';

import { getPreviousEvents } from '../common';
import { processMintEvent } from './processMintEvent';

export const syncMints = async (
  bigQuery: BigQuery,
  amms: AMM[],
  previousBlockNumber: number,
): Promise<number> => {
  const previousMintEvents = await getPreviousEvents(amms, 'mint', previousBlockNumber);

  let counter = 0;

  const promises = Object.values(previousMintEvents).map(async ({ amm, events }) => {
    for (const swapEvent of events) {
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
