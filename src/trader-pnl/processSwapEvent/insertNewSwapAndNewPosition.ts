import { BigQuery } from '@google-cloud/bigquery';
import { AMM } from '@voltz-protocol/v1-sdk';

import { secondsToBqDate } from '../../big-query-support/utils';
import { DATASET_ID, POSITIONS_TABLE_ID, PROJECT_ID, SWAPS_TABLE_ID } from '../../common';
import { generatePositionRow } from '../../common/swaps/generatePositionRow';
import { generateSwapRow } from './generateSwapRow';
import { SwapEventInfo } from '../../common/swaps/parseSwapEvent';

export const insertNewSwapAndNewPosition = async (
  bigQuery: BigQuery,
  amm: AMM,
  eventInfo: SwapEventInfo,
  eventTimestamp: number,
): Promise<void> => {
  console.log('Inserting a new swap and a new position');

  // generate swap row
  const swapRow = generateSwapRow(eventInfo, eventTimestamp);

  const swapTableId = `${PROJECT_ID}.${DATASET_ID}.${SWAPS_TABLE_ID}`;

  const rawSwapRow = `
    \"${eventInfo.eventId}\",
    \"${swapRow.vammAddress}\",
    \"${swapRow.ownerAddress}\",
    ${swapRow.tickLower}, 
    ${swapRow.tickUpper}, 
    ${swapRow.notionalLocked}, 
    ${swapRow.fixedRateLocked},
    ${swapRow.feePaidToLps}, 
    \'${secondsToBqDate(swapRow.eventTimestamp)}\', 
    \'${secondsToBqDate(swapRow.rowLastUpdatedTimestamp)}\',
    \'${swapRow.rateOracle}\',
    \'${swapRow.underlyingToken}\',
    \'${swapRow.marginEngineAddress}\',
    ${swapRow.chainId}
  `;

  // generate position row
  const positionRow = await generatePositionRow(amm, eventInfo, eventTimestamp, null);

  const positionTableId = `${PROJECT_ID}.${DATASET_ID}.${POSITIONS_TABLE_ID}`;

  const rawPositionRow = `
    \"${positionRow.marginEngineAddress}\",
    \"${positionRow.vammAddress}\",
    \"${positionRow.ownerAddress}\",
    ${positionRow.tickLower},
    ${positionRow.tickUpper},
    ${positionRow.realizedPnLFromSwaps},
    ${positionRow.realizedPnLFromFeesPaid},
    ${positionRow.netNotionalLocked},
    ${positionRow.netFixedRateLocked},
    \'${secondsToBqDate(positionRow.lastUpdatedTimestamp)}\',
    ${positionRow.notionalLiquidityProvided},                
    ${positionRow.realizedPnLFromFeesCollected},
    ${positionRow.netMarginDeposited},
    ${positionRow.rateOracleIndex},
    \'${secondsToBqDate(positionRow.rowLastUpdatedTimestamp)}\',
    ${positionRow.fixedTokenBalance},
    ${positionRow.variableTokenBalance},
    \'${secondsToBqDate(positionRow.positionInitializationTimestamp)}\',
    \'${positionRow.rateOracle}\',
    \'${positionRow.underlyingToken}\',
    ${positionRow.chainId}
  `;

  // build and fire sql query
  const sqlTransactionQuery = `
    BEGIN 
      BEGIN TRANSACTION;
        INSERT INTO \`${swapTableId}\` VALUES (${rawSwapRow});
        INSERT INTO \`${positionTableId}\` VALUES(${rawPositionRow});          
      COMMIT TRANSACTION;
    END;
  `;

  const options = {
    query: sqlTransactionQuery,
    timeoutMs: 100000,
    useLegacySql: false,
  };

  await bigQuery.query(options);

  console.log(
    `Inserted new swap with eventId: ${eventInfo.eventId} and inserted a new position for ${swapRow.ownerAddress}`,
  );
};
