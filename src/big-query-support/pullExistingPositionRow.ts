import { BigQuery } from '@google-cloud/bigquery';

import { DATASET_ID, POSITIONS_TABLE_ID, PROJECT_ID } from '../common/constants';

export type PositionRow = {
  id: string;
  netNotionalLocked: number;
  netFixedRateLocked: number;
  realizedPnLFromSwaps: number;
  realizedPnLFromFeesPaid: number;
  lastUpdatedTimestamp: number;
};

export const pullExistingPositionRow = async (
  bigQuery: BigQuery,
  vammAddress: string,
  recipient: string,
  tickLower: number,
  tickUpper: number,
): Promise<PositionRow | null> => {
  const sqlQuery = `SELECT * FROM \`${PROJECT_ID}.${DATASET_ID}.${POSITIONS_TABLE_ID}\` 
                      WHERE vammAddress=\"${vammAddress}\" AND ownerAddress=\"${recipient}\" 
                      AND tickLower=${tickLower} AND tickUpper=${tickUpper}`;

  const options = {
    query: sqlQuery,
  };

  const [rows] = await bigQuery.query(options);

  if (!rows || rows.length === 0) {
    return null;
  }

  return rows[0] as PositionRow;
};
