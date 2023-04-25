import { Table } from '@google-cloud/bigquery';

import { getBigQuery } from '../../global';
import { getTable } from '../get-table';
import { DATASET_ID, getTableName } from '../utils';

export const createPoolsTable = async (): Promise<void> => {
  const bigQuery = getBigQuery();
  const tableName = getTableName('pools');

  const existingTable: Table | null = await getTable(tableName);

  if (existingTable) {
    console.log(`${tableName} already exists`);
    return;
  }

  // todo: replace precision and scale in here with the constants PRECISION & SCALE
  const schema = [
    { name: 'eventId', type: 'STRING', mode: 'REQUIRED' },
    { name: 'chainId', type: 'INTEGER', mode: 'REQUIRED' },
    { name: 'factory', type: 'STRING', mode: 'REQUIRED' },

    { name: 'vamm', type: 'STRING', mode: 'REQUIRED' },
    { name: 'marginEngine', type: 'STRING', mode: 'REQUIRED' },

    { name: 'eventBlockNumber', type: 'INTEGER', mode: 'REQUIRED' },
    { name: 'eventTimestamp', type: 'TIMESTAMP', mode: 'REQUIRED' },
    { name: 'rowLastUpdatedTimestamp', type: 'TIMESTAMP', mode: 'REQUIRED' },

    { name: 'termStartTimestamp', type: 'TIMESTAMP', mode: 'REQUIRED' },
    { name: 'termEndTimestamp', type: 'TIMESTAMP', mode: 'REQUIRED' },

    { name: 'rateOracleId', type: 'STRING', mode: 'REQUIRED' },
    { name: 'rateOracleIndex', type: 'INTEGER', mode: 'REQUIRED' },

    { name: 'underlyingToken', type: 'STRING', mode: 'REQUIRED' },
    { name: 'tokenDecimals', type: 'INTEGER', mode: 'REQUIRED' },
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
