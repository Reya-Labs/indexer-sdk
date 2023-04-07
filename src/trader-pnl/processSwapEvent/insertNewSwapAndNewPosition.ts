import { BigQuery } from '@google-cloud/bigquery';
import { AMM } from '@voltz-protocol/v1-sdk';

import { DATASET_ID, POSITIONS_TABLE_ID, PROJECT_ID, SWAPS_TABLE_ID } from '../../common';
import { generateNewPositionRow } from './generateNewPositionRow';
import { generateSwapRow } from './generateSwapRow';
import { SwapEventInfo } from './parseSwapEvent';

export const insertNewSwapAndNewPosition = async (
  bigQuery: BigQuery,
  amm: AMM,
  eventInfo: SwapEventInfo,
  eventTimestamp: number,
): Promise<void> => {
  console.log('Inserting a new swap and a new position');

  // generate swap row
  const swapRow = generateSwapRow(bigQuery, eventInfo, eventTimestamp);

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
    \'${swapRow.eventTimestamp}\', 
    \'${swapRow.rowLastUpdatedTimestamp}\'
  `;

  // generate position row
  const positionRow = generateNewPositionRow(bigQuery, amm, eventInfo, eventTimestamp);

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
    \'${positionRow.lastUpdatedTimestamp}\',
    ${positionRow.notionalLiquidityProvided},                
    ${positionRow.realizedPnLFromFeesCollected},
    ${positionRow.netMarginDeposited},
    ${1},
    \'${positionRow.rowLastUpdatedTimestamp}\',
    ${0},
    ${0},
    \'${swapRow.eventTimestamp}\'
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
