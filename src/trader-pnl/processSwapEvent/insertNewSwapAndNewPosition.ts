import { BigQuery } from '@google-cloud/bigquery';
import { AMM } from '@voltz-protocol/v1-sdk';

import { secondsToBqDate } from '../../big-query-support/utils';
import { POSITIONS_TABLE_ID, SWAPS_TABLE_ID } from '../../common';
import { generatePositionRow } from '../../common/swaps/generatePositionRow';
import { SwapEventInfo } from '../../common/swaps/parseSwapEvent';
import { generateSwapRow } from './generateSwapRow';

export const insertNewSwapAndNewPosition = async (
  bigQuery: BigQuery,
  amm: AMM,
  eventInfo: SwapEventInfo,
  eventTimestamp: number,
): Promise<void> => {
  console.log('Inserting a new swap and a new position');

  // generate swap row
  const swapRow = generateSwapRow(eventInfo, eventTimestamp);

  const rawSwapRow = `
    \"${swapRow.eventId}\",
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
        INSERT INTO \`${SWAPS_TABLE_ID}\` VALUES (${rawSwapRow});
        INSERT INTO \`${POSITIONS_TABLE_ID}\` VALUES(${rawPositionRow});          
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
