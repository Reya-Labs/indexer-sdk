import { BigQuery } from '@google-cloud/bigquery';

import {
  generateLpPositionUpdatesQuery,
  pullExistingLpPositionRows,
} from '../../big-query-support';
import { VAMMPriceChangeEventInfo } from '../../common/event-parsers';
import { generateLpPositionRowsFromPassiveSwaps } from '../../lp-pnl/processPassiveSwapEvents/generateLpPositionRowsFromPassiveSwaps';
import { gPassiveSwapEvents } from './gPassiveSwapEvents';
import { blockNumberToTimestamp } from '../../common/event-parsers/blockNumberToTimestamp';

export const processVAMMPriceChangeEvent = async (
  bigQuery: BigQuery,
  priceChangeEventInfo: VAMMPriceChangeEventInfo,
): Promise<void> => {

  const existingLpPositionRows = await pullExistingLpPositionRows(
    bigQuery,
    priceChangeEventInfo.amm.id,
    priceChangeEventInfo.eventBlockNumber,
  );

  const { passiveSwapEvents, affectedLps } = gPassiveSwapEvents({
    existingLpPositionRows,
    amm: priceChangeEventInfo.amm,
    priceChangeEventInfo,
  });

  if (affectedLps.length === 0) {
    // since the latest checkpoint, no lps were affected by passive swaps
    return;
  }

  const eventTimestamp = await blockNumberToTimestamp(priceChangeEventInfo.chainId, priceChangeEventInfo.eventBlockNumber);

  const lpPositionRows = await generateLpPositionRowsFromPassiveSwaps({
    passiveSwapEvents,
    affectedLps,
    chainId: priceChangeEventInfo.chainId,
    amm: priceChangeEventInfo.amm,
    eventTimestamp: eventTimestamp,
    eventBlockNumber: priceChangeEventInfo.eventBlockNumber,
  });

  const sqlTransactionQuery = generateLpPositionUpdatesQuery(lpPositionRows);

  console.log(sqlTransactionQuery);

  const options = {
    query: sqlTransactionQuery,
    timeoutMs: 100000,
    useLegacySql: false,
  };

  await bigQuery.query(options);
};
