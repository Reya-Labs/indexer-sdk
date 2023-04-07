import { BigQuery } from '@google-cloud/bigquery';
import { AMM } from '@voltz-protocol/v1-sdk';
import { ethers } from 'ethers';

import { PositionRow } from '../../big-query-support';
import { DATASET_ID, POSITIONS_TABLE_ID, PROJECT_ID, SWAPS_TABLE_ID } from '../../common';
import { generateSwapRow } from './generateSwapRow';
import { generateUpdatedExistingPositionRow } from './generateUpdatedExistingPositionRow';

export const insertNewSwapAndUpdateExistingPosition = async (
  bigQuery: BigQuery,
  amm: AMM,
  eventId: string,
  event: ethers.Event,
  existingPosition: PositionRow,
): Promise<void> => {
  console.log('Inserting a new swap and updating an existing position');

  const swapRow = await generateSwapRow(bigQuery, amm, eventId, event);
  const positionRow = await generateUpdatedExistingPositionRow(
    bigQuery,
    amm,
    event,
    existingPosition,
  );

  const sqlTransactionQuery = `
            BEGIN 
              
              BEGIN TRANSACTION;
                
                INSERT INTO \`${PROJECT_ID}.${DATASET_ID}.${SWAPS_TABLE_ID}\`
                  VALUES (\"${eventId}\",\"${swapRow.vammAddress}\",\"${swapRow.ownerAddress}\",
                  ${swapRow.tickLower}, ${swapRow.tickUpper}, ${swapRow.notionalLocked}, ${swapRow.fixedRateLocked},
                  ${swapRow.feePaidToLps}, \'${swapRow.eventTimestamp}\', \'${swapRow.rowLastUpdatedTimestamp}\');
                
                UPDATE \`${PROJECT_ID}.${DATASET_ID}.${POSITIONS_TABLE_ID}\`
                  SET marginEngineAddress=\"${positionRow.marginEngineAddress}\",
                  realizedPnLFromSwaps=${positionRow.realizedPnLFromSwaps},realizedPnLFromFeesPaid=${positionRow.realizedPnLFromFeesPaid},
                  netNotionalLocked=${positionRow.netNotionalLocked},netFixedRateLocked=${positionRow.netFixedRateLocked},
                  lastUpdatedTimestamp=\'${positionRow.lastUpdatedTimestamp}\',notionalLiquidityProvided=${positionRow.notionalLiquidityProvided},
                  realizedPnLFromFeesCollected=${positionRow.realizedPnLFromFeesCollected},netMarginDeposited=${positionRow.netMarginDeposited},
                  rowLastUpdatedTimestamp=\'${positionRow.rowLastUpdatedTimestamp}\'
                  WHERE vammAddress=\"${positionRow.vammAddress}\" AND ownerAddress=\"${positionRow.ownerAddress}\" AND tickLower=${positionRow.tickLower} AND tickUpper=${positionRow.tickUpper};
    
              COMMIT TRANSACTION;
            
            END;`;

  const options = {
    query: sqlTransactionQuery,
    timeoutMs: 100000,
    useLegacySql: false,
  };

  await bigQuery.query(options);

  console.log(
    `Inserted new swap with eventId: ${eventId} and updated an existing position for ${swapRow.ownerAddress}`,
  );
};
