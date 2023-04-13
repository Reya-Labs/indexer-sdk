/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import { BigQuery } from '@google-cloud/bigquery';

import { DATASET_ID, LAST_PROCESSED_BLOCK_ID, PROJECT_ID } from '../common';

export const getLastProcessedBlock = async (
  bigQuery: BigQuery,
  processId: string,
): Promise<number> => {
  const tableId = `${PROJECT_ID}.${DATASET_ID}.${LAST_PROCESSED_BLOCK_ID}`;

  const sqlQuery = `SELECT * FROM \`${tableId}\` WHERE process_id=\"${processId}\"`;

  const options = {
    query: sqlQuery,
  };

  const [rows] = await bigQuery.query(options);

  if (!rows || rows.length === 0) {
    return 0;
  }

  return rows[0].last_block as number;
};
