import { BigQuery } from '@google-cloud/bigquery';

import { DATASET_ID, PROJECT_ID, SWAPS_TABLE_ID } from '../common/constants';

type SwapRow = {
  id: string;
};

export const pullExistingSwapRow = async (
  bigQuery: BigQuery,
  eventId: string,
): Promise<SwapRow | null> => {
  const sqlQuery = `SELECT * FROM \`${PROJECT_ID}.${DATASET_ID}.${SWAPS_TABLE_ID}\`
                      WHERE eventId=\"${eventId}\"`;

  const options = {
    query: sqlQuery,
  };

  const [rows] = await bigQuery.query(options);

  if (!rows || rows.length === 0) {
    return null;
  }

  return rows[0] as SwapRow;
};
