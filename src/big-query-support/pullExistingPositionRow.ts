/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import { BigQuery } from '@google-cloud/bigquery';

import { DATASET_ID, POSITIONS_TABLE_ID, PROJECT_ID } from '../common';
import { bqNumericToNumber, bqTimestampToUnixSeconds } from './utils';

export type BigQueryPositionRow = {
  marginEngineAddress: string; // immutable
  vammAddress: string; // immutable
  ownerAddress: string; // immutable
  tickLower: number; // immutable
  tickUpper: number; // immutable
  realizedPnLFromSwaps: number;
  realizedPnLFromFeesPaid: number;
  netNotionalLocked: number;
  netFixedRateLocked: number;
  lastUpdatedTimestamp: number;
  notionalLiquidityProvided: number;
  realizedPnLFromFeesCollected: number;
  netMarginDeposited: number;
  rateOracleIndex: number; // immutable
  rowLastUpdatedTimestamp: number;
  fixedTokenBalance: number;
  variableTokenBalance: number;
  positionInitializationTimestamp: number; // immutable
  rateOracle: string; // immutable
  underlyingToken: string; // immutable
  chainId: string; // immutable
};

export const pullExistingPositionRow = async (
  bigQuery: BigQuery,
  vammAddress: string,
  recipient: string,
  tickLower: number,
  tickUpper: number,
): Promise<BigQueryPositionRow | null> => {
  const positionTableId = `${PROJECT_ID}.${DATASET_ID}.${POSITIONS_TABLE_ID}`;
  const sqlQuery = `
    SELECT * FROM \`${positionTableId}\` 
      WHERE vammAddress=\"${vammAddress}\" AND 
            ownerAddress=\"${recipient}\" AND 
            tickLower=${tickLower} AND 
            tickUpper=${tickUpper}
  `;

  const options = {
    query: sqlQuery,
  };

  const [rows] = await bigQuery.query(options);

  if (!rows || rows.length === 0) {
    return null;
  }

  return {
    marginEngineAddress: rows[0].marginEngineAddress,
    vammAddress: rows[0].vammAddress,
    ownerAddress: rows[0].ownerAddress,
    tickLower: rows[0].tickLower,
    tickUpper: rows[0].tickUpper,
    realizedPnLFromSwaps: bqNumericToNumber(rows[0].realizedPnLFromSwaps),
    realizedPnLFromFeesPaid: bqNumericToNumber(rows[0].realizedPnLFromFeesPaid),
    netNotionalLocked: bqNumericToNumber(rows[0].netNotionalLocked),
    netFixedRateLocked: bqNumericToNumber(rows[0].netFixedRateLocked),
    lastUpdatedTimestamp: bqTimestampToUnixSeconds(rows[0].lastUpdatedTimestamp),
    notionalLiquidityProvided: bqNumericToNumber(rows[0].notionalLiquidityProvided),
    realizedPnLFromFeesCollected: bqNumericToNumber(rows[0].realizedPnLFromFeesCollected),
    netMarginDeposited: bqNumericToNumber(rows[0].netMarginDeposited),
    rateOracleIndex: bqNumericToNumber(rows[0].rateOracleIndex),
    rowLastUpdatedTimestamp: bqTimestampToUnixSeconds(rows[0].rowLastUpdatedTimestamp),
    fixedTokenBalance: bqNumericToNumber(rows[0].fixedTokenBalance),
    variableTokenBalance: bqNumericToNumber(rows[0].variableTokenBalance),
    positionInitializationTimestamp: bqTimestampToUnixSeconds(
      rows[0].positionInitializationTimestamp,
    ),
    rateOracle: rows[0].rateOracle,
    underlyingToken: rows[0].underlyingToken,
    chainId: rows[0].chainId,
  };
};
