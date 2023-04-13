import { BigQuery } from "@google-cloud/bigquery";

export async function pullRows(sqlQuery: string, bigQuery: BigQuery) {
    
    const options = {
      query: sqlQuery,
    };
  
    const [rows] = await bigQuery.query(options);
  
    if ((rows === undefined) || rows.length === 0) {
      return null;
    }
  
    return rows;
}