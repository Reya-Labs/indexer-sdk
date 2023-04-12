import { BigQuery } from '@google-cloud/bigquery';
import { AMM } from '@voltz-protocol/v1-sdk';

import { getPreviousEvents } from '../common';
import { processMintOrBurnEvent } from './processMintAndBurnEvent';

export const sync = async (
  chainId: number,
  bigQuery: BigQuery,
  amms: AMM[],
  fromBlock: number,
  toBlock: number,
): Promise<void> => {
  
  const previousMintEvents = await getPreviousEvents(amms, ['mint'], fromBlock, toBlock);

  const promises = Object.values(previousMintEvents).map(async ({ amm, events }) => {
    for (const event of events) {
      // todo: check if we can infer event name from the event
      await processMintOrBurnEvent(chainId, bigQuery, amm, event, true);
    }
  });

  const output = await Promise.allSettled(promises);
  output.forEach((v) => {
    if (v.status === 'rejected') {
      throw v.reason;
    }
  });
};
