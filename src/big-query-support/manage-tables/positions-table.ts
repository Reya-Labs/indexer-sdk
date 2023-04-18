import { BigQuery, Table } from '@google-cloud/bigquery';
import { DATASET_ID } from '../../common';
import { getTable } from './get-table';

export const createPositionsTable = async (
  tableName: string,
  bigQuery: BigQuery,
): Promise<void> => {
  const existingTable: Table | null = await getTable(tableName, bigQuery);

  if (existingTable !== null) {
    console.log('A positions table already exists');
    return;
  }

  // todo: replace precision and scale in here with the constants PRECISION & SCALE
  const schema = [
    { name: 'marginEngineAddress', type: 'STRING', mode: 'REQUIRED' },
    { name: 'vammAddress', type: 'STRING', mode: 'REQUIRED' },
    { name: 'ownerAddress', type: 'STRING', mode: 'REQUIRED' },
    { name: 'tickLower', type: 'INTEGER', mode: 'REQUIRED' },
    { name: 'tickUpper', type: 'INTEGER', mode: 'REQUIRED' },
    {
      name: 'realizedPnLFromSwaps',
      type: 'NUMERIC',
      mode: 'REQUIRED',
      precision: '18',
      scale: '9',
    },
    {
      name: 'realizedPnLFromFeesPaid',
      type: 'NUMERIC',
      mode: 'REQUIRED',
      precision: '18',
      scale: '9',
    },
    { name: 'netNotionalLocked', type: 'NUMERIC', mode: 'REQUIRED', precision: '18', scale: '9' },
    { name: 'netFixedRateLocked', type: 'NUMERIC', mode: 'REQUIRED', precision: '18', scale: '9' },
    { name: 'lastUpdatedBlockNumber', type: 'INTEGER', mode: 'REQUIRED' },
    {
      name: 'notionalLiquidityProvided',
      type: 'NUMERIC',
      mode: 'REQUIRED',
      precision: '18',
      scale: '9',
    },
    {
      name: 'realizedPnLFromFeesCollected',
      type: 'NUMERIC',
      mode: 'REQUIRED',
      precision: '18',
      scale: '9',
    },
    { name: 'netMarginDeposited', type: 'NUMERIC', mode: 'REQUIRED', precision: '18', scale: '9' },
    { name: 'rateOracleIndex', type: 'NUMERIC', mode: 'REQUIRED', precision: '18', scale: '9' },
    { name: 'rowLastUpdatedTimestamp', type: 'TIMESTAMP', mode: 'REQUIRED' },
    { name: 'fixedTokenBalance', type: 'NUMERIC', mode: 'REQUIRED', precision: '18', scale: '9' },
    {
      name: 'variableTokenBalance',
      type: 'NUMERIC',
      mode: 'REQUIRED',
      precision: '18',
      scale: '9',
    },
    { name: 'positionInitializationBlockNumber', type: 'INTEGER', mode: 'REQUIRED' },
    { name: 'rateOracle', type: 'STRING', mode: 'REQUIRED' },
    { name: 'underlyingToken', type: 'STRING', mode: 'REQUIRED' },
    { name: 'chainId', type: 'INTEGER', mode: 'REQUIRED' },
    { name: 'cashflowLiFactor', type: 'NUMERIC', mode: 'REQUIRED', precision: '18', scale: '9' },
    { name: 'cashflowTimeFactor', type: 'NUMERIC', mode: 'REQUIRED', precision: '18', scale: '9' },
    { name: 'cashflowFreeTerm', type: 'NUMERIC', mode: 'REQUIRED', precision: '18', scale: '9' },
    { name: 'liquidity', type: 'NUMERIC', mode: 'REQUIRED', precision: '18', scale: '9' },
    { name: 'tickPrevious', type: 'INTEGER', mode: 'REQUIRED' },
  ];

  // For all options, see https://cloud.google.com/bigquery/docs/reference/v2/tables#resource
  const options = {
    schema: schema,
    location: 'europe-west2',
  };

  // Create a new table in the dataset
  const [table] = await bigQuery.dataset(DATASET_ID).createTable(tableName, options);

  console.log(`Table ${table.id} created.`);
};
