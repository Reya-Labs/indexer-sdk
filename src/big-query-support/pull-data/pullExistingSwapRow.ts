import { ACTIVE_SWAPS_TABLE_ID } from '../../common/constants';
import { getBigQuery } from '../../global';
import { mapToBigQuerySwapRow } from './mappers';
import { BigQuerySwapRow } from './types';

export const pullExistingSwapRow = async (eventId: string): Promise<BigQuerySwapRow | null> => {
  const bigQuery = getBigQuery();

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
