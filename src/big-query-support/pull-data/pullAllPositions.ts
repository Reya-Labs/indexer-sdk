import { POSITIONS_TABLE_ID } from '../../common/constants';
import { getBigQuery } from '../../global';
import { mapToBigQueryPositionRow } from './mappers';
import { BigQueryPositionRow } from './types';

export type TrackedBigQueryPositionRow = {
  position: BigQueryPositionRow;
  added: boolean;
  modified: boolean;
};

export const pullAllPositions = async (): Promise<TrackedBigQueryPositionRow[]> => {
  const bigQuery = getBigQuery();

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

  const lpPositionRows = rows.map(
    (row): TrackedBigQueryPositionRow => ({
      position: mapToBigQueryPositionRow(row),
      added: false,
      modified: false,
    }),
  );

  return lpPositionRows;
};
