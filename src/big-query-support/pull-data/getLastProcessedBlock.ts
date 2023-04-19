/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import { BigQuery } from '@google-cloud/bigquery';

import { LAST_PROCESSED_BLOCK_TABLE_ID } from '../../common';


export const getLastProcessedBlock = async (
  bigQuery: BigQuery,
  processId: string,
): Promise<number> => {
  const sqlQuery = `SELECT * FROM \`${LAST_PROCESSED_BLOCK_TABLE_ID}\` WHERE process_id=\"${processId}\"`;

  const options = {
    query: sqlQuery,
  };

  const [rows] = await bigQuery.query(options);

  if (!rows || rows.length === 0) {
    return 0;
  }

  return rows[0].last_block as number;
};
