/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import { BigQuery } from '@google-cloud/bigquery';

import { DATASET_ID, POSITIONS_TABLE_ID, PROJECT_ID } from '../common';
import { BigQueryPositionRow } from './pullExistingPositionRow';
import { bqNumericToNumber, bqTimestampToUnixSeconds, secondsToBqDate } from './utils';

export const pullExistingLpPositionRows = async (
  bigQuery: BigQuery,
  vammAddress: string,
  currentTimestamp: number,
): Promise<BigQueryPositionRow[]> => {
  const currentTimestampBQ = secondsToBqDate(currentTimestamp);
  const positionTableId = `${PROJECT_ID}.${DATASET_ID}.${POSITIONS_TABLE_ID}`;

  // note, since we're doing time based indexing of passive swaps, can't rely on extra details from the swap event
  const sqlQuery = `
    SELECT * FROM \`${positionTableId}\` 
      WHERE 
        notionalLiquidityProvided>0 AND 
        positionInitializationTimestamp<\'${currentTimestampBQ}\' AND
        vammAddress=\"${vammAddress}\"
    `;

  const options = {
    query: sqlQuery,
  };

  const [rows] = await bigQuery.query(options);

  if (!rows || rows.length === 0) {
    return [];
  }

  const lpPositionRows = rows.map((row) => {
    return {
      marginEngineAddress: row.marginEngineAddress,
      vammAddress: row.vammAddress,
      ownerAddress: row.ownerAddress,
      tickLower: row.tickLower,
      tickUpper: row.tickUpper,
      realizedPnLFromSwaps: bqNumericToNumber(row.realizedPnLFromSwaps),
      realizedPnLFromFeesPaid: bqNumericToNumber(row.realizedPnLFromFeesPaid),
      netNotionalLocked: bqNumericToNumber(row.netNotionalLocked),
      netFixedRateLocked: bqNumericToNumber(row.netFixedRateLocked),
      lastUpdatedTimestamp: bqTimestampToUnixSeconds(row.lastUpdatedTimestamp),
      notionalLiquidityProvided: bqNumericToNumber(row.notionalLiquidityProvided),
      realizedPnLFromFeesCollected: bqNumericToNumber(row.realizedPnLFromFeesCollected),
      netMarginDeposited: bqNumericToNumber(row.netMarginDeposited),
      rateOracleIndex: bqNumericToNumber(row.rateOracleIndex),
      rowLastUpdatedTimestamp: bqTimestampToUnixSeconds(row.rowLastUpdatedTimestamp),
      fixedTokenBalance: bqNumericToNumber(row.fixedTokenBalance),
      variableTokenBalance: bqNumericToNumber(row.variableTokenBalance),
      positionInitializationTimestamp: bqTimestampToUnixSeconds(
        row.positionInitializationTimestamp,
      ),
      rateOracle: row.rateOracle,
      underlyingToken: row.underlyingToken,
      chainId: row.chainId,
    };
  });

  return lpPositionRows;
};
