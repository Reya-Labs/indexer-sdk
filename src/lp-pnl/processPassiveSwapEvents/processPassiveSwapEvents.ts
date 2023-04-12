import { BigQuery } from '@google-cloud/bigquery';
import { AMM } from '@voltz-protocol/v1-sdk';
import { ethers } from 'ethers';

import {
  generateLpPositionUpdatesQuery,
  pullExistingLpPositionRows,
} from '../../big-query-support';
import { parseSwapEvent } from '../../common/swaps/parseSwapEvent';
import { ExtendedEvent } from '../../common/types';
import { generateLpPositionRowsFromPassiveSwaps } from './generateLpPositionRowsFromPassiveSwaps';
import { generatePassiveSwapEvents } from './generatePassiveSwapEvents';

export type ProcessPassiveSwapEventsArgs = {
  bigQuery: BigQuery;
  event: ExtendedEvent;
  chainId: number;
};

export const processPassiveSwapEvents = async ({
  bigQuery,
  event,
  chainId,
}: ProcessPassiveSwapEventsArgs): Promise<void> => {
  // Get information about root swap event
  const rootEventInfo = parseSwapEvent(chainId, event.amm, event);

  // Retrieve the current timestamp
  const eventTimestamp = (await event.getBlock()).timestamp;

  console.log(`Processing passive swap at ${new Date(eventTimestamp * 1000).toISOString()}`);

  // Retrieve all LPs
  const existingLpPositionRows = await pullExistingLpPositionRows(bigQuery, event.amm.id, eventTimestamp);

  const { passiveSwapEvents, affectedLps } = await generatePassiveSwapEvents({
    existingLpPositionRows,
    amm: event.amm,
    rootEventInfo,
    eventTimestamp,
  });

  if (affectedLps.length === 0) {
    // since the latest checkpoint, no lps were affected by passive swaps
    return;
  }

  const lpPositionRows = await generateLpPositionRowsFromPassiveSwaps({
    passiveSwapEvents,
    affectedLps,
    bigQuery,
    chainId,
    amm: event.amm,
    currentTimestamp: eventTimestamp,
  });

  const sqlTransactionQuery = generateLpPositionUpdatesQuery(lpPositionRows);

  const options = {
    query: sqlTransactionQuery,
    timeoutMs: 100000,
    useLegacySql: false,
  };

  await bigQuery.query(options);

  console.log(`Updated ${lpPositionRows.length} from passive swaps`);
};
