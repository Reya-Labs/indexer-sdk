/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import { BigQuery } from '@google-cloud/bigquery';

import { LAST_PROCESSED_BLOCK_TABLE_ID } from '../common/constants';
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
): Promise<boolean> => {
  // todo: find a way to dynamically understand if the queue is full
  // do batched mutations vs. for loops -> P1 or consider using a different db
  // https://cloud.google.com/bigquery/docs/best-practices-performance-patterns#dml_statements_that_update_or_insert_single_rows

  try {
    const doesExist = (await getLastProcessedBlock(bigQuery, processId)) > 0;

    const sqlQuery = doesExist
      ? getUpdateQuery(LAST_PROCESSED_BLOCK_TABLE_ID, processId, lastBlock)
      : getInsertQuery(LAST_PROCESSED_BLOCK_TABLE_ID, processId, lastBlock);

    const options = {
      query: sqlQuery,
      timeoutMs: 100000,
      useLegacySql: false,
    };

    await bigQuery.query(options);

    // console.log(`Updated last processed block of ${processId} to ${lastBlock}`);

    return true;
  } catch (error) {
    // console.log(`Setting last processed block in bq cache has failed with error: ${(error as Error).message}.`);
    return false;
  }
};
