import { BigQuery, BigQueryInt, BigQueryTimestamp } from '@google-cloud/bigquery';

import { DATASET_ID, POSITIONS_TABLE_ID, PROJECT_ID } from '../common';
import { bqNumericToNumber, bqTimestampToUnixSeconds } from './utils';

export type PositionRow = {
  marginEngineAddress: string;
  vammAddress: string;
  ownerAddress: string;
  tickLower: number;
  tickUpper: number;
  realizedPnLFromSwaps: number;
  realizedPnLFromFeesPaid: number;
  netNotionalLocked: number;
  netFixedRateLocked: number;
  lastUpdatedTimestamp: number;
  notionalLiquidityProvided: number;
  realizedPnLFromFeesCollected: number;
  netMarginDeposited: number;
  rateOracleIndex: number;
  rowLastUpdatedTimestamp: number;
  variableTokenBalance: number;
  positionInitializationTimestamp: number;
};

export const pullExistingPositionRow = async (
  bigQuery: BigQuery,
  vammAddress: string,
  recipient: string,
  tickLower: number,
  tickUpper: number,
): Promise<PositionRow | null> => {

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

  const positionRow = rows[0] as {
    marginEngineAddress: string;
    vammAddress: string;
    ownerAddress: string;
    tickLower: number;
    tickUpper: number;
    realizedPnLFromSwaps: BigQueryInt;
    realizedPnLFromFeesPaid: BigQueryInt;
    netNotionalLocked: BigQueryInt;
    netFixedRateLocked: BigQueryInt;
    lastUpdatedTimestamp: BigQueryTimestamp;
    notionalLiquidityProvided: BigQueryInt;
    realizedPnLFromFeesCollected: BigQueryInt;
    netMarginDeposited: BigQueryInt;
    rateOracleIndex: BigQueryInt;
    rowLastUpdatedTimestamp: BigQueryTimestamp;
    variableTokenBalance: BigQueryInt;
    positionInitializationTimestamp: BigQueryTimestamp;
  };

  const resp =  {
    marginEngineAddress: positionRow.marginEngineAddress,
    vammAddress: positionRow.vammAddress,
    ownerAddress: positionRow.ownerAddress,
    tickLower: positionRow.tickLower,
    tickUpper: positionRow.tickUpper,
    realizedPnLFromSwaps: bqNumericToNumber(positionRow.realizedPnLFromSwaps),
    realizedPnLFromFeesPaid: bqNumericToNumber(positionRow.realizedPnLFromFeesPaid),
    netNotionalLocked: bqNumericToNumber(positionRow.netNotionalLocked),
    netFixedRateLocked: bqNumericToNumber(positionRow.netFixedRateLocked),
    lastUpdatedTimestamp: bqTimestampToUnixSeconds(positionRow.lastUpdatedTimestamp),
    notionalLiquidityProvided: bqNumericToNumber(positionRow.notionalLiquidityProvided),
    realizedPnLFromFeesCollected: bqNumericToNumber(positionRow.realizedPnLFromFeesCollected),
    netMarginDeposited: bqNumericToNumber(positionRow.netMarginDeposited),
    rateOracleIndex: bqNumericToNumber(positionRow.rateOracleIndex),
    rowLastUpdatedTimestamp: bqTimestampToUnixSeconds(positionRow.rowLastUpdatedTimestamp),
    variableTokenBalance: bqNumericToNumber(positionRow.variableTokenBalance),
    positionInitializationTimestamp: bqTimestampToUnixSeconds(positionRow.positionInitializationTimestamp),
  };

  return resp;
};
