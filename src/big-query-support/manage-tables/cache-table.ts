import { BigQuery, Table } from '@google-cloud/bigquery';

import { DATASET_ID } from '../../common';
import { getTable } from './get-table';

export const createCacheTable = async (tableName: string, bigQuery: BigQuery): Promise<void> => {
  const existingTable: Table | null = await getTable(tableName, bigQuery);

  if (existingTable) {
    console.log('A cache table already exists');
    return;
  }

  const schema = [
    { name: 'process_id', type: 'STRING', mode: 'REQUIRED' },
    { name: 'last_block', type: 'INTEGER', mode: 'REQUIRED' },
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
