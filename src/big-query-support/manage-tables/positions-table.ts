import { Table } from '@google-cloud/bigquery';

import { DATASET_ID } from '../../common/constants';
import { getBigQuery } from '../../global';
import { getTable } from './get-table';

export const createPositionsTable = async (tableName: string): Promise<void> => {
  const bigQuery = getBigQuery();
  const existingTable: Table | null = await getTable(tableName);

  if (existingTable) {
    console.log(`${tableName} already exists`);
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
      type: 'BIGNUMERIC',
      mode: 'REQUIRED',
      precision: '18',
      scale: '18',
    },
    {
      name: 'realizedPnLFromFeesPaid',
      type: 'BIGNUMERIC',
      mode: 'REQUIRED',
      precision: '18',
      scale: '18',
    },
    { name: 'netNotionalLocked', type: 'BIGNUMERIC', mode: 'REQUIRED', precision: '18', scale: '18' },
    { name: 'netFixedRateLocked', type: 'BIGNUMERIC', mode: 'REQUIRED', precision: '18', scale: '18' },
    { name: 'lastUpdatedBlockNumber', type: 'INTEGER', mode: 'REQUIRED' },
    {
      name: 'notionalLiquidityProvided',
      type: 'BIGNUMERIC',
      mode: 'REQUIRED',
      precision: '18',
      scale: '18',
    },
    {
      name: 'realizedPnLFromFeesCollected',
      type: 'BIGNUMERIC',
      mode: 'REQUIRED',
      precision: '18',
      scale: '18',
    },
    { name: 'netMarginDeposited', type: 'BIGNUMERIC', mode: 'REQUIRED', precision: '18', scale: '18' },
    { name: 'rateOracleIndex', type: 'BIGNUMERIC', mode: 'REQUIRED', precision: '18', scale: '18' },
    { name: 'rowLastUpdatedTimestamp', type: 'TIMESTAMP', mode: 'REQUIRED' },
    { name: 'fixedTokenBalance', type: 'BIGNUMERIC', mode: 'REQUIRED', precision: '18', scale: '18' },
    {
      name: 'variableTokenBalance',
      type: 'BIGNUMERIC',
      mode: 'REQUIRED',
      precision: '18',
      scale: '18',
    },
    { name: 'positionInitializationBlockNumber', type: 'INTEGER', mode: 'REQUIRED' },
    { name: 'rateOracle', type: 'STRING', mode: 'REQUIRED' },
    { name: 'underlyingToken', type: 'STRING', mode: 'REQUIRED' },
    { name: 'chainId', type: 'INTEGER', mode: 'REQUIRED' },
    { name: 'cashflowLiFactor', type: 'BIGNUMERIC', mode: 'REQUIRED', precision: '18', scale: '18' },
    { name: 'cashflowTimeFactor', type: 'BIGNUMERIC', mode: 'REQUIRED', precision: '18', scale: '18' },
    { name: 'cashflowFreeTerm', type: 'BIGNUMERIC', mode: 'REQUIRED', precision: '18', scale: '18' },
    { name: 'liquidity', type: 'BIGNUMERIC', mode: 'REQUIRED', precision: '18', scale: '18' },
  ];

  // For all options, see https://cloud.google.com/bigquery/docs/reference/v2/tables#resource
  const options = {
    schema: schema,
    location: 'europe-west2',
  };

  // Create a new table in the dataset
  const [table] = await bigQuery.dataset(DATASET_ID).createTable(tableName, options);

  console.log(`Table ${table.id || ''} created.`);
};
