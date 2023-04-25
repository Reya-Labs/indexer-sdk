import { getBigQuery } from '../../../global';
import { mapToBigQueryPoolRow } from '../../mappers';
import { BigQueryPoolRow } from '../../types';
import { getTableFullID } from '../../utils';

export const pullExistingPoolRow = async (eventId: string): Promise<BigQueryPoolRow | null> => {
  const bigQuery = getBigQuery();

  const sqlQuery = `SELECT * FROM \`${getTableFullID('pools')}\` WHERE eventId=\"${eventId}\"`;

  const options = {
    query: sqlQuery,
  };

  const [rows] = await bigQuery.query(options);

  if (!rows || rows.length === 0) {
    return null;
  }

  return mapToBigQueryPoolRow(rows[0]);
};
