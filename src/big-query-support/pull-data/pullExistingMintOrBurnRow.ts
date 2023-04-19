import { BigQuery } from '@google-cloud/bigquery';

import { MINTS_BURNS_TABLE_ID } from '../../common/constants';
import { mapToBigQueryMintOrBurnRow } from './mappers';
import { BigQueryMintOrBurnRow } from './types';

export const pullExistingMintOrBurnRow = async (
  bigQuery: BigQuery,
  eventId: string,
): Promise<BigQueryMintOrBurnRow | null> => {
  const sqlQuery = `SELECT * FROM \`${MINTS_BURNS_TABLE_ID}\` WHERE eventId=\"${eventId}\"`;

  const options = {
    query: sqlQuery,
  };

  const [rows] = await bigQuery.query(options);

  if (!rows || rows.length === 0) {
    return null;
  }

  return mapToBigQueryMintOrBurnRow(rows[0]);
};
