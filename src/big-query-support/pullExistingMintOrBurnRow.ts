/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import { BigQuery } from '@google-cloud/bigquery';

import { DATASET_ID, PROJECT_ID, MINTS_BURNS_TABLE_ID } from '../common';
import { bqNumericToNumber, bqTimestampToUnixSeconds } from './utils';

export type BigQueryMintBurnRow = {
  eventId: string;
  vammAddress: string;
  ownerAddress: string;
  tickLower: number;
  tickUpper: number;
  notionalDelta: number;
  eventTimestamp: number;
  rowLastUpdatedTimestamp: number;
  rateOracle: string;
  underlyingToken: string;
  marginEngineAddress: string;
  chainId: number;
};

export const pullExistingMintOrBurnRow = async (
  bigQuery: BigQuery,
  eventId: string,
): Promise<BigQueryMintBurnRow | null> => {
  const mintBurnTableId = `${PROJECT_ID}.${DATASET_ID}.${MINTS_BURNS_TABLE_ID}`;
  const sqlQuery = `SELECT * FROM \`${mintBurnTableId}\` WHERE eventId=\"${eventId}\"`;

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
    notionalDelta: bqNumericToNumber(rows[0].notionalDelta),
    eventTimestamp: bqTimestampToUnixSeconds(rows[0].eventTimestamp),
    rowLastUpdatedTimestamp: bqTimestampToUnixSeconds(rows[0].rowLastUpdatedTimestamp),
    rateOracle: rows[0].rateOracle,
    underlyingToken: rows[0].underlyingToken,
    marginEngineAddress: rows[0].marginEngineAddress,
    chainId: bqNumericToNumber(rows[0].chainId),
  };
};
