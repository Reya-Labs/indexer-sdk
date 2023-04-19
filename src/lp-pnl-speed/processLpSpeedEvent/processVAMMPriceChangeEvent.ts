import { BigQuery } from '@google-cloud/bigquery';

import {
  generateLpPositionUpdatesQuery,
  pullExistingLpPositionRows,
} from '../../big-query-support';
import { blockNumberToTimestamp, getLiquidityIndex } from '../../common';
import { VAMMPriceChangeEventInfo } from '../../common/event-parsers';
import { generatePositionRow } from '../../common/swaps/generatePositionRow';
import { gPassiveSwapEvents } from './gPassiveSwapEvents';

export const processVAMMPriceChangeEvent = async (
  bigQuery: BigQuery,
  priceChangeEventInfo: VAMMPriceChangeEventInfo,
): Promise<void> => {
  // Pull all LP positions
  const existingLpPositionRows = await pullExistingLpPositionRows(
    bigQuery,
    priceChangeEventInfo.amm.id,
    priceChangeEventInfo.eventBlockNumber,
  );

  // Generate passive swap events
  const { passiveSwapEvents, affectedLps } = gPassiveSwapEvents({
    existingLpPositionRows,
    priceChangeEventInfo,
  });

  // Skip if there is no affected LP
  if (affectedLps.length === 0) {
    return;
  }

  console.log(`Updating ${affectedLps.length} LPs due to tick change.`);

  const eventTimestamp = await blockNumberToTimestamp(
    priceChangeEventInfo.amm.provider,
    priceChangeEventInfo.eventBlockNumber,
  );

  const liquidityIndexAtRootEvent = await getLiquidityIndex(
    priceChangeEventInfo.chainId,
    priceChangeEventInfo.amm.provider,
    priceChangeEventInfo.amm.marginEngineAddress,
    priceChangeEventInfo.eventBlockNumber,
  );

  const lpPositionRows = affectedLps.map((affectedLp, i) =>
    generatePositionRow(
      priceChangeEventInfo.amm,
      passiveSwapEvents[i],
      eventTimestamp,
      affectedLp,
      liquidityIndexAtRootEvent,
    ),
  );

  const sqlTransactionQuery = generateLpPositionUpdatesQuery(lpPositionRows);

  const options = {
    query: sqlTransactionQuery,
    timeoutMs: 100000,
    useLegacySql: false,
  };

  await bigQuery.query(options);
};
