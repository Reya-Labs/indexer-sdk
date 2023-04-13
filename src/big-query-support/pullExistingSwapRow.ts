/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import { BigQuery } from '@google-cloud/bigquery';

import { SWAPS_TABLE_ID } from '../common';
import { bqNumericToNumber, bqTimestampToUnixSeconds } from './utils';

export type BigQuerySwapRow = {
  eventId: string;
  vammAddress: string;
  ownerAddress: string;
  tickLower: number;
  tickUpper: number;
  variableTokenDelta: number;
  fixedTokenDeltaUnbalanced: number;
  feePaidToLps: number;
  eventTimestamp: number;
  rowLastUpdatedTimestamp: number;
  rateOracle: string;
  underlyingToken: string;
  marginEngineAddress: string;
  chainId: number;
};

export const pullExistingSwapRow = async (
  bigQuery: BigQuery,
  eventId: string,
): Promise<BigQuerySwapRow | null> => {
  const sqlQuery = `SELECT * FROM \`${SWAPS_TABLE_ID}\` WHERE eventId=\"${eventId}\"`;

  const options = {
    query: sqlQuery,
  };

  const [rows] = await bigQuery.query(options);

  if (!rows || rows.length === 0) {
    return null;
  }

  return {
    eventId: rows[0].eventId,
    vammAddress: rows[0].vammAddress,
    ownerAddress: rows[0].ownerAddress,
    tickLower: rows[0].tickLower,
    tickUpper: rows[0].tickUpper,
    variableTokenDelta: bqNumericToNumber(rows[0].notionalLocked),
    fixedTokenDeltaUnbalanced: bqNumericToNumber(rows[0].fixedTokenDeltaUnbalanced),
    feePaidToLps: bqNumericToNumber(rows[0].feePaidToLps),
    eventTimestamp: bqTimestampToUnixSeconds(rows[0].eventTimestamp),
    rowLastUpdatedTimestamp: bqTimestampToUnixSeconds(rows[0].rowLastUpdatedTimestamp),
    rateOracle: rows[0].rateOracle,
    underlyingToken: rows[0].underlyingToken,
    marginEngineAddress: rows[0].marginEngineAddress,
    chainId: bqNumericToNumber(rows[0].chainId),
  };
};
