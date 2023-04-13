import { BigQuery } from '@google-cloud/bigquery';
import { AMM } from '@voltz-protocol/v1-sdk';

import { getPreviousEvents, setFromBlock } from '../common';
import { processMintOrBurnEvent } from './processMintAndBurnEvent';

export const sync = async (
  bigQuery: BigQuery,
  amms: AMM[],
): Promise<void> => {
  const previousMintEvents = await getPreviousEvents('mint_burn', amms, ['mint', 'burn']);

  const promises = Object.values(previousMintEvents).map(async ({ events }) => {
    for (const event of events) {
      await processMintOrBurnEvent(bigQuery, event);
      await setFromBlock('mint_burn', event.chainId, event.address, event.blockNumber);
    }
  });

  const output = await Promise.allSettled(promises);
  output.forEach((v) => {
    if (v.status === 'rejected') {
      throw v.reason;
    }
  });
};
