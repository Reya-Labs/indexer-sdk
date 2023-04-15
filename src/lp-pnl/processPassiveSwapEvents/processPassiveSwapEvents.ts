import { BigQuery } from '@google-cloud/bigquery';

import {
  generateLpPositionUpdatesQuery,
  pullExistingLpPositionRows,
} from '../../big-query-support';
import { parseSwapEvent } from '../../common/event-parsers/parseSwapEvent';
import { ExtendedEvent } from '../../common/types';
import { generateLpPositionRowsFromPassiveSwaps } from './generateLpPositionRowsFromPassiveSwaps';
import { generatePassiveSwapEvents } from './generatePassiveSwapEvents';

export type ProcessPassiveSwapEventsArgs = {
  bigQuery: BigQuery;
  event: ExtendedEvent;
};

export const processPassiveSwapEvents = async ({
  bigQuery,
  event,
}: ProcessPassiveSwapEventsArgs): Promise<void> => {
  // Get information about root swap event
  const rootEventInfo = parseSwapEvent(event);

  // Retrieve all LPs
  const existingLpPositionRows = await pullExistingLpPositionRows(
    bigQuery,
    event.amm.id,
    rootEventInfo.eventTimestamp,
  );

  const { passiveSwapEvents, affectedLps } = await generatePassiveSwapEvents({
    existingLpPositionRows,
    amm: event.amm,
    rootEventInfo
  });

  if (affectedLps.length === 0) {
    // since the latest checkpoint, no lps were affected by passive swaps
    return;
  }

  const lpPositionRows = await generateLpPositionRowsFromPassiveSwaps({
    passiveSwapEvents,
    affectedLps,
    chainId: rootEventInfo.chainId,
    amm: rootEventInfo.amm,
    eventTimestamp: rootEventInfo.eventTimestamp,
    eventBlockNumber: rootEventInfo.eventBlockNumber,
  });

  const sqlTransactionQuery = generateLpPositionUpdatesQuery(lpPositionRows);

  const options = {
    query: sqlTransactionQuery,
    timeoutMs: 100000,
    useLegacySql: false,
  };

  await bigQuery.query(options);

  console.log(
    `Updated ${lpPositionRows.length} LP positions from passive swap at ${new Date(
      rootEventInfo.eventTimestamp * 1000,
    ).toISOString()}`,
  );
};
