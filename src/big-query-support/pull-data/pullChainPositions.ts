import { BigQuery } from '@google-cloud/bigquery';

import { POSITIONS_TABLE_ID } from '../../common/constants';
import { mapToBigQueryPositionRow } from './mappers';
import { BigQueryPositionRow } from './types';

export const pullAllPositions = async (
  bigQuery: BigQuery,
): Promise<BigQueryPositionRow[]> => {
  const sqlQuery = `
    SELECT * FROM \`${POSITIONS_TABLE_ID}\` 
  `;

  const options = {
    query: sqlQuery,
  };

  const [rows] = await bigQuery.query(options);

  if (!rows || rows.length === 0) {
    return [];
  }

  const lpPositionRows = rows.map(mapToBigQueryPositionRow);

  return lpPositionRows;
};
