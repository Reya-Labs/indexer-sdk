import { BigQuery } from '@google-cloud/bigquery';
import { AMM } from '@voltz-protocol/v1-sdk';
import { ethers } from 'ethers';

import { DATASET_ID, POSITIONS_TABLE_ID, PROJECT_ID, SWAPS_TABLE_ID } from '../../common';
import { generateNewPositionRow } from './generateNewPositionRow';
import { generateSwapRow } from './generateSwapRow';

export const insertNewSwapAndNewPosition = async (
  bigQuery: BigQuery,
  amm: AMM,
  eventId: string,
  event: ethers.Event,
): Promise<void> => {
  console.log('Inserting a new swap and a new position');

  const swapRow = await generateSwapRow(bigQuery, amm, eventId, event);
  const positionRow = await generateNewPositionRow(bigQuery, amm, event);

  const sqlTransactionQuery = `
              BEGIN 
              
              BEGIN TRANSACTION;
                  
                  INSERT INTO \`${PROJECT_ID}.${DATASET_ID}.${SWAPS_TABLE_ID}\`
                  VALUES (\"${eventId}\",\"${swapRow.vammAddress}\",\"${swapRow.ownerAddress}\",
                  ${swapRow.tickLower}, ${swapRow.tickUpper}, ${swapRow.notionalLocked}, ${
    swapRow.fixedRateLocked
  },
                  ${swapRow.feePaidToLps}, \'${swapRow.eventTimestamp}\', \'${
    swapRow.rowLastUpdatedTimestamp
  }\');
                  
                  INSERT INTO \`${PROJECT_ID}.${DATASET_ID}.${POSITIONS_TABLE_ID}\`
                  VALUES(
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
                      ${0}
                      );           
  
              COMMIT TRANSACTION;
              
              END;`;

  const options = {
    query: sqlTransactionQuery,
    timeoutMs: 100000,
    useLegacySql: false,
  };

  await bigQuery.query(options);

  console.log(
    `Inserted new swap with eventId: ${eventId} and inserted a new position for ${swapRow.ownerAddress}`,
  );
};
