import { BigQuery } from '@google-cloud/bigquery';
import { AMM } from '@voltz-protocol/v1-sdk';

import { getPreviousEvents } from '../common';
import { processMintOrBurnEvent } from './processMintAndBurnEvent';

export const sync = async (
  bigQuery: BigQuery,
  amms: AMM[],
  fromBlock: number,
  toBlock: number,
): Promise<void> => {
  const previousMintEvents = await getPreviousEvents(amms, ['mint', 'burn'], fromBlock, toBlock);

  const promises = Object.values(previousMintEvents).map(async ({ events }) => {
    for (const event of events) {
      await processMintOrBurnEvent(bigQuery, event);       
    }
  });

  const output = await Promise.allSettled(promises);
  output.forEach((v) => {
    if (v.status === 'rejected') {
      throw v.reason;
    }
  });
};
