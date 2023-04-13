/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import { BigQuery } from '@google-cloud/bigquery';

import { DATASET_ID, LAST_PROCESSED_BLOCK_ID, PROJECT_ID } from '../common';
import { getLastProcessedBlock } from './getLastProcessedBlock';

const getInsertQuery = (tableId: string, processId: string, lastBlock: number): string => {
  const sqlQuery = `INSERT INTO \`${tableId}\` VALUES(\"${processId}\",${lastBlock});`;
  return sqlQuery;
};

const getUpdateQuery = (tableId: string, processId: string, lastBlock: number): string => {
  const sqlQuery = `UPDATE \`${tableId}\` SET last_block=${lastBlock} WHERE process_id=\"${processId}\";`;
  return sqlQuery;
};

export const setLastProcessedBlock = async (
  bigQuery: BigQuery,
  processId: string,
  lastBlock: number,
): Promise<void> => {
  const tableId = `${PROJECT_ID}.${DATASET_ID}.${LAST_PROCESSED_BLOCK_ID}`;

  const doesExist = (await getLastProcessedBlock(bigQuery, processId)) > 0;

  const sqlQuery = doesExist
    ? getUpdateQuery(tableId, processId, lastBlock)
    : getInsertQuery(tableId, processId, lastBlock);

  const options = {
    query: sqlQuery,
    timeoutMs: 100000,
    useLegacySql: false,
  };

  await bigQuery.query(options);

  console.log(`Updated last processed block of ${processId} to ${lastBlock}`);
};
