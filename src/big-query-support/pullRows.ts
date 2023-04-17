/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import { BigQuery } from '@google-cloud/bigquery';

// todo: typings
export async function pullRows(sqlQuery: string, bigQuery: BigQuery): Promise<any> {
  const options = {
    query: sqlQuery,
  };

  const [rows] = await bigQuery.query(options);

  if (rows === undefined || rows.length === 0) {
    return null;
  }

  return rows;
}
