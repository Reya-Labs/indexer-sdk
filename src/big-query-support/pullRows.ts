import { BigQuery, RowMetadata, SimpleQueryRowsResponse } from '@google-cloud/bigquery';

export async function pullRows(sqlQuery: string, bigQuery: BigQuery): Promise<RowMetadata> {
  const options = {
    query: sqlQuery,
  };

  const [rows]: SimpleQueryRowsResponse = await bigQuery.query(options);

  if (rows === undefined || rows.length === 0) {
    return null;
  }

  return rows;
}
