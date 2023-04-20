import { MINTS_BURNS_TABLE_ID } from '../../common/constants';
import { getBigQuery } from '../../global';
import { mapToBigQueryMintOrBurnRow } from './mappers';
import { BigQueryMintOrBurnRow } from './types';

export const pullExistingMintOrBurnRow = async (
  eventId: string,
): Promise<BigQueryMintOrBurnRow | null> => {
  const bigQuery = getBigQuery();
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
