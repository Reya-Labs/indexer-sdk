import { BigQuery } from '@google-cloud/bigquery';

import {
  generateLpPositionUpdatesQuery,
  pullExistingLpPositionRows,
} from '../../big-query-support';
import { blockNumberToTimestamp, getLiquidityIndex } from '../../common';
import { VAMMPriceChangeEventInfo } from '../../common/event-parsers';
import { generatePositionRow } from '../../common/swaps/generatePositionRow';
import { generatePassiveSwapEvents } from './generatePassiveSwapEvents';

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
  const passiveSwapEvents = generatePassiveSwapEvents({
    existingLpPositionRows,
    priceChangeEventInfo,
  });

  // Skip if there is no affected LP
  if (passiveSwapEvents.length === 0) {
    return;
  }

  console.log(`Updating ${passiveSwapEvents.length} LPs due to tick change.`);

  // Retrieve event timestamp
  const eventTimestamp = await blockNumberToTimestamp(
    priceChangeEventInfo.amm.provider,
    priceChangeEventInfo.eventBlockNumber,
  );

  // Retrieve liquidity index at the event block
  const liquidityIndexAtRootEvent = await getLiquidityIndex(
    priceChangeEventInfo.chainId,
    priceChangeEventInfo.amm.provider,
    priceChangeEventInfo.amm.marginEngineAddress,
    priceChangeEventInfo.eventBlockNumber,
  );

  // Generate all passive swap events
  const lpPositionRows = passiveSwapEvents.map(({ affectedLP, passiveSwapEvent}) =>
    generatePositionRow(
      priceChangeEventInfo.amm,
      passiveSwapEvent,
      eventTimestamp,
      affectedLP,
      liquidityIndexAtRootEvent,
    ),
  );

  // Update all affected LPs
  const sqlTransactionQuery = generateLpPositionUpdatesQuery(lpPositionRows);

  const options = {
    query: sqlTransactionQuery,
    timeoutMs: 100000,
    useLegacySql: false,
  };

  await bigQuery.query(options);
};
