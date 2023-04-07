import { BigQuery, BigQueryInt, BigQueryTimestamp } from '@google-cloud/bigquery';

import { DATASET_ID, PROJECT_ID, SWAPS_TABLE_ID } from '../common';
import { bqNumericToNumber, bqTimestampToUnixSeconds } from './utils';

type SwapRow = {
  eventId: string;
  vammAddress: string;
  ownerAddress: string;
  tickLower: number;
  tickUpper: number;
  notionalLocked: number;
  fixedRateLocked: number;
  feePaidToLps: number;
  eventTimestamp: number;
  rowLastUpdatedTimestamp: number;
};

export const pullExistingSwapRow = async (
  bigQuery: BigQuery,
  eventId: string,
): Promise<SwapRow | null> => {
  const swapTableId = `${PROJECT_ID}.${DATASET_ID}.${SWAPS_TABLE_ID}`;
  const sqlQuery = `SELECT * FROM \`${swapTableId}\` WHERE eventId=\"${eventId}\"`;

  const options = {
    query: sqlQuery,
  };

  const [rows] = await bigQuery.query(options);

  if (!rows || rows.length === 0) {
    return null;
  }

  const swapRow = rows[0] as {
    eventId: string,
    vammAddress: string,
    ownerAddress: string,
    tickLower: number,
    tickUpper: number,
    notionalLocked: BigQueryInt,
    fixedRateLocked: BigQueryInt,
    feePaidToLps: BigQueryInt,
    eventTimestamp: BigQueryTimestamp,
    rowLastUpdatedTimestamp: BigQueryTimestamp,
  };

  return {
    eventId: swapRow.eventId,
    vammAddress: swapRow.vammAddress,
    ownerAddress: swapRow.ownerAddress,
    tickLower: swapRow.tickLower,
    tickUpper: swapRow.tickUpper,
    notionalLocked: bqNumericToNumber(swapRow.notionalLocked),
    fixedRateLocked: bqNumericToNumber(swapRow.fixedRateLocked),
    feePaidToLps: bqNumericToNumber(swapRow.feePaidToLps),
    eventTimestamp: bqTimestampToUnixSeconds(swapRow.eventTimestamp),
    rowLastUpdatedTimestamp: bqTimestampToUnixSeconds(swapRow.rowLastUpdatedTimestamp),
  };
};
