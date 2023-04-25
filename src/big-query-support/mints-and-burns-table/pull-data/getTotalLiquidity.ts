import { BigQueryInt } from '@google-cloud/bigquery';

import { dollarAggregate } from '../../../api/common/dollarAggregate';
import { GECKO_KEY } from '../../../common/constants';
import { getBigQuery } from '../../../global';
import { bqNumericToNumber, getTableFullID } from '../../utils';

/**
 Get chain total liquidity
 */
export const getChainTotalLiquidity = async (chainId: number): Promise<number> => {
  const bigQuery = getBigQuery();

  const liquidityQuery = `
    SELECT underlyingToken, sum(notionalDelta) as amount
      FROM \`${getTableFullID('mints_and_burns')}\`
      WHERE chainId=${chainId}
      GROUP BY underlyingToken
  `;

  const options = {
    query: liquidityQuery,
  };

  const [rows] = await bigQuery.query(options);

  if (!rows || rows.length === 0) {
    return 0;
  }

  const parsedRows = rows.map((row: { underlyingToken: string; amount: BigQueryInt }) => ({
    underlyingToken: row.underlyingToken,
    amount: bqNumericToNumber(row.amount),
  }));

  const totalLiquidityInDollars = await dollarAggregate(parsedRows, GECKO_KEY);

  return totalLiquidityInDollars;
};
