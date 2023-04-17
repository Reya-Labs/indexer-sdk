import { BigQuery } from "@google-cloud/bigquery";
import { DATASET_ID, PROJECT_ID } from "../../common";


export const createPositionTable = async (tableId: number, bigQuery: BigQuery) => {

  const tableName = `${PROJECT_ID}.${DATASET_ID}.Voltz V1 Positions Staging ${tableId}`;  

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