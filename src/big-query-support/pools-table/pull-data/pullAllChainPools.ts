import { getBigQuery } from '../../../global';
import { mapToBigQueryPoolRow } from '../../mappers';
import { BigQueryPoolRow } from '../../types';
import { getTableFullID } from '../../utils';

export const pullAllChainPools = async (chainId: number): Promise<BigQueryPoolRow[]> => {
  const bigQuery = getBigQuery();

  const sqlQuery = `SELECT * FROM \`${getTableFullID('pools')}\` WHERE chainId=${chainId}`;

  const options = {
    query: sqlQuery,
  };

  const [rows] = await bigQuery.query(options);

  if (!rows) {
    return [];
  }

  console.log('pools:', rows);

  return rows.map(mapToBigQueryPoolRow);
};
