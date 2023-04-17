import { BigQuery, Table } from "@google-cloud/bigquery";
import { DATASET_ID } from "../../common";

export const getPositionsTable = async (tableName: string, bigQuery: BigQuery): Promise<Table | null> => {

    // todo: check typings and add tests 
    
    const dataset = bigQuery.dataset(DATASET_ID);

    const [table] = await dataset.table(tableName).get();

    return table;

}

export const createPositionsTable = async (tableName: string, bigQuery: BigQuery): Promise<void> => {

  const existingTable: Table | null = await getPositionsTable(tableName, bigQuery);

  if (existingTable !== null) {
    return; 
  }

  const schema = `

    marginEngineAddress:string, vammAddress:string, ownerAddress:string, 
    tickLower:integer, tickUpper:integer, realizedPnLFromSwaps:numeric, 
    realizedPnLFromFeesPaid:numeric, netNotionalLocked:numeric,
    netFixedRate:numeric, lastUpdatedTimestamp:timestamp, notionalLiquidityProvided:numeric,
    realizedPnLFromFeesCollected:numeric, netMarginDeposited:numeric, rateOracleIndex:numeric,
    rowLastUpdatedTimestamp:timestamp, fixedTokenBalance:numeric, variableTokenBalance:numeric,
    positionInitializationTimestamp:timestamp, rateOracle: string, underlyingToken: string,
    chainId:integer, cashflowFactor:numeric(18,9), cashflowTimeFactor:numeric(18,9), cashflowFreeTerm:numeric(18,9),
    liquidity:numeric(18,9), tickPrevious:integer`;

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