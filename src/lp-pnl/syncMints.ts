import { BigQuery } from '@google-cloud/bigquery';
import { AMM } from '@voltz-protocol/v1-sdk';

import { getPreviousEvents } from '../common';
import { processMintEvent } from './processMintEvent';

export const syncMints = async (
  chainId: number,
  bigQuery: BigQuery,
  amms: AMM[],
  fromBlock: number,
  toBlock: number,
): Promise<void> => {
  const previousMintEvents = await getPreviousEvents(amms, 'mint', fromBlock, toBlock);

  const promises = Object.values(previousMintEvents).map(async ({ amm, events }) => {
    for (const swapEvent of events.filter(
      (e) =>
        (e.args?.owner as string).toLowerCase() ===
        '0xb527E950fC7c4F581160768f48b3bfA66a7dE1f0'.toLowerCase(),
    )) {
      await processMintEvent(chainId, bigQuery, amm, swapEvent);
    }
  });

  const output = await Promise.allSettled(promises);
  output.forEach((v) => {
    if (v.status === 'rejected') {
      throw v.reason;
    }
  });
};
