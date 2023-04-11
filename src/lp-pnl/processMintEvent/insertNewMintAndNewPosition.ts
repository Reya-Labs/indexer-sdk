import { BigQuery } from '@google-cloud/bigquery';
import { AMM } from '@voltz-protocol/v1-sdk';

import { BigQueryPositionRow } from '../../big-query-support';
import { secondsToBqDate } from '../../big-query-support/utils';
import { DATASET_ID, POSITIONS_TABLE_ID, PROJECT_ID } from '../../common';
import { generateLpPositionRow } from '../../common/mints/generateLpPositionRow';
import { MintEventInfo } from '../../common/mints/parseMintEvent';

export const insertNewMintAndNewPosition = async (
  bigQuery: BigQuery,
  amm: AMM,
  eventInfo: MintEventInfo,
  eventTimestamp: number,
): Promise<void> => {
  console.log('Inserting new position following a mint');

  // generate position row
  const positionRow: BigQueryPositionRow = generateLpPositionRow(amm, eventInfo, eventTimestamp);

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

  console.log(`Inserted a new position for ${positionRow.ownerAddress}`);
};
