import { BigQuery } from '@google-cloud/bigquery';
import { AMM } from '@voltz-protocol/v1-sdk';

import { BigQueryPositionRow } from '../../big-query-support';
import { secondsToBqDate } from '../../big-query-support/utils';
import { POSITIONS_TABLE_ID, SWAPS_TABLE_ID } from '../../common';
import { generatePositionRow } from '../../common/swaps/generatePositionRow';
import { SwapEventInfo } from '../../common/swaps/parseSwapEvent';
import { generateSwapRow } from './generateSwapRow';

export const insertNewSwapAndUpdateExistingPosition = async (
  bigQuery: BigQuery,
  amm: AMM,
  eventInfo: SwapEventInfo,
  eventTimestamp: number,
  existingPosition: BigQueryPositionRow,
): Promise<void> => {
  console.log('Inserting a new swap and updating an existing position');

  const swapRow = generateSwapRow(eventInfo, eventTimestamp);

  const positionRow = await generatePositionRow(amm, eventInfo, eventTimestamp, existingPosition);

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

  const sqlTransactionQuery = `
    BEGIN 
      BEGIN TRANSACTION;
        INSERT INTO \`${SWAPS_TABLE_ID}\` VALUES (${rawSwapRow});
                
        UPDATE \`${POSITIONS_TABLE_ID}\`
          SET realizedPnLFromSwaps=${positionRow.realizedPnLFromSwaps},
              realizedPnLFromFeesPaid=${positionRow.realizedPnLFromFeesPaid},
              netNotionalLocked=${positionRow.netNotionalLocked},
              netFixedRateLocked=${positionRow.netFixedRateLocked},
              lastUpdatedTimestamp=\'${secondsToBqDate(positionRow.lastUpdatedTimestamp)}\',
              notionalLiquidityProvided=${positionRow.notionalLiquidityProvided},
              realizedPnLFromFeesCollected=${positionRow.realizedPnLFromFeesCollected},
              netMarginDeposited=${positionRow.netMarginDeposited},
              rowLastUpdatedTimestamp=\'${secondsToBqDate(positionRow.rowLastUpdatedTimestamp)}\',
              fixedTokenBalance=${positionRow.fixedTokenBalance},
              variableTokenBalance=${positionRow.variableTokenBalance}
              WHERE chainId=${positionRow.chainId} AND 
                    vammAddress=\"${positionRow.vammAddress}\" AND 
                    ownerAddress=\"${positionRow.ownerAddress}\" AND 
                    tickLower=${positionRow.tickLower} AND 
                    tickUpper=${positionRow.tickUpper};
    
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
    `Inserted new swap with eventId: ${eventInfo.eventId} and updated an existing position for ${swapRow.ownerAddress}`,
  );
};
