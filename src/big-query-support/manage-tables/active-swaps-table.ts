import { BigQuery, Table } from '@google-cloud/bigquery';

import { DATASET_ID } from '../../common/constants';
import { getTable } from './get-table';

export const createActiveSwapsTable = async (
  tableName: string,
  bigQuery: BigQuery,
): Promise<void> => {
  const existingTable: Table | null = await getTable(tableName, bigQuery);

  if (existingTable) {
    console.log(`${tableName} already exists`);
    return;
  }

  // todo: replace precision and scale in here with the constants PRECISION & SCALE
  const schema = [
    { name: 'eventId', type: 'STRING', mode: 'REQUIRED' },
    { name: 'vammAddress', type: 'STRING', mode: 'REQUIRED' },
    { name: 'ownerAddress', type: 'STRING', mode: 'REQUIRED' },
    { name: 'tickLower', type: 'INTEGER', mode: 'REQUIRED' },
    { name: 'tickUpper', type: 'INTEGER', mode: 'REQUIRED' },

    {
      name: 'variableTokenDelta',
      type: 'NUMERIC',
      mode: 'REQUIRED',
      precision: '18',
      scale: '9',
    },
    {
      name: 'fixedTokenDeltaUnbalanced',
      type: 'NUMERIC',
      mode: 'REQUIRED',
      precision: '18',
      scale: '9',
    },
    { name: 'feePaidToLps', type: 'NUMERIC', mode: 'REQUIRED', precision: '18', scale: '9' },

    { name: 'eventBlockNumber', type: 'INTEGER', mode: 'REQUIRED' },
    { name: 'eventTimestamp', type: 'TIMESTAMP', mode: 'REQUIRED' },
    { name: 'rowLastUpdatedTimestamp', type: 'TIMESTAMP', mode: 'REQUIRED' },

    { name: 'rateOracle', type: 'STRING', mode: 'REQUIRED' },
    { name: 'underlyingToken', type: 'STRING', mode: 'REQUIRED' },
    { name: 'marginEngineAddress', type: 'STRING', mode: 'REQUIRED' },
    { name: 'chainId', type: 'INTEGER', mode: 'REQUIRED' },
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
