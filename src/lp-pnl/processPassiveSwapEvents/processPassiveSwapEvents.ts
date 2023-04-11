import { BigQuery } from '@google-cloud/bigquery';
import { AMM } from '@voltz-protocol/v1-sdk';
import { ethers } from 'ethers';

import {
  generateLpPositionUpdatesQuery,
  pullExistingLpPositionRows,
} from '../../big-query-support';
import { parseSwapEvent } from '../../common/swaps/parseSwapEvent';
import { generateLpPositionRowsFromPassiveSwaps } from './generateLpPositionRowsFromPassiveSwaps';
import { generatePassiveSwapEvents } from './generatePassiveSwapEvents';

export type ProcessPassiveSwapEventsArgs = {
  bigQuery: BigQuery;
  amm: AMM;
  event: ethers.Event;
  // todo: not sure if possible to derive chain id from the ethers.Event object
  chainId: number;
  provider: ethers.providers.Provider;
};

export const processPassiveSwapEvents = async ({
  bigQuery,
  amm,
  event,
  chainId,
}: ProcessPassiveSwapEventsArgs): Promise<void> => {
  // Get information about root swap event
  const rootEventInfo = parseSwapEvent(chainId, amm, event);

  // Retrieve the current timestamp
  const eventTimestamp = (await event.getBlock()).timestamp;

  // Retrieve all LPs
  const existingLpPositionRows = await pullExistingLpPositionRows(bigQuery, eventTimestamp);

  const { passiveSwapEvents, affectedLps } = await generatePassiveSwapEvents({
    existingLpPositionRows,
    amm,
    rootEventInfo,
    eventTimestamp,
  });

  const lpPositionRows = await generateLpPositionRowsFromPassiveSwaps({
    passiveSwapEvents,
    affectedLps,
    bigQuery,
    chainId,
    amm,
    currentTimestamp: eventTimestamp,
  });

  if (lpPositionRows.length === 0) {
    // since the latest checkpoint, no lps were affected by passive swaps
    return;
  }

  const sqlTransactionQuery: string = generateLpPositionUpdatesQuery(lpPositionRows);

  const options = {
    query: sqlTransactionQuery,
    timeoutMs: 100000,
    useLegacySql: false,
  };

  await bigQuery.query(options);

  console.log(`Updated ${lpPositionRows.length} from passive swaps`);
};
