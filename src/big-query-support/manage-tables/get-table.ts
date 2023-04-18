import { BigQuery, Table } from '@google-cloud/bigquery';
import { DATASET_ID } from '../../common';

export const getTable = async (tableName: string, bigQuery: BigQuery): Promise<Table | null> => {
  // todo: check typings and add tests

  const [tables] = await bigQuery.dataset(DATASET_ID).getTables();

  const table: Table | undefined = tables.find((table) => {
    return table.id === tableName;
  });

  if (table === undefined) {
    return null;
  }

  return table;
};
