import { BigQuery } from '@google-cloud/bigquery';

import { ACTIVE_SWAPS_TABLE_ID } from '../../common/constants';
import { mapToBigQuerySwapRow } from './mappers';
import { BigQuerySwapRow } from './types';

export const pullExistingSwapRow = async (
  bigQuery: BigQuery,
  eventId: string,
): Promise<BigQuerySwapRow | null> => {
  const sqlQuery = `SELECT * FROM \`${ACTIVE_SWAPS_TABLE_ID}\` WHERE eventId=\"${eventId}\"`;

  const options = {
    query: sqlQuery,
  };

  const [rows] = await bigQuery.query(options);

  if (!rows || rows.length === 0) {
    return null;
  }

  return mapToBigQuerySwapRow(rows[0]);
};
