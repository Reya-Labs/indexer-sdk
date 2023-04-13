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
    for (const swapEvent of events) {
      if (
        !(
          (swapEvent.args?.owner as string).toLowerCase() ===
          '0xb527e950fc7c4f581160768f48b3bfa66a7de1f0'.toLowerCase()
        )
      ) {
        continue;
      }
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
