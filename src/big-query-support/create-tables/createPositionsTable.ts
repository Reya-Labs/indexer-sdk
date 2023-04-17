import { BigQuery } from "@google-cloud/bigquery";
import { DATASET_ID, PROJECT_ID } from "../../common";




export const createPositionTable = async (tableId: number, bigQuery: BigQuery,) => {

    const tableName = `${PROJECT_ID}.${DATASET_ID}.Voltz V1 Positions Staging ${tableId}`;  


  const schema = 'Name:string, Age:integer, Weight:float, IsMagic:boolean';

  // For all options, see https://cloud.google.com/bigquery/docs/reference/v2/tables#resource
  const options = {
    schema: schema, 
    location: 'europe-west2',
  };
  
  // Create a new table in the dataset
  const [table] = await bigQuery
    .dataset(DATASET_ID)
    .createTable(tableName, options);

  console.log(`Table ${table.id} created.`);

}