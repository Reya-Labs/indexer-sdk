/* eslint-disable */
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
