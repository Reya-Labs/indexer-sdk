import { BigQuery } from '@google-cloud/bigquery';

import { POSITIONS_TABLE_ID } from '../../common';
import { mapToBigQueryPositionRow } from './mappers';
import { BigQueryPositionRow } from './types';

export const pullExistingLpPositionRows = async (
  bigQuery: BigQuery,
  vammAddress: string,
  currentBlockNumber: number,
): Promise<BigQueryPositionRow[]> => {
  const sqlQuery = `
    SELECT * FROM \`${POSITIONS_TABLE_ID}\` 
      WHERE 
        notionalLiquidityProvided>0 AND 
        positionInitializationBlockNumber<${currentBlockNumber} AND
        vammAddress=\"${vammAddress}\"
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
