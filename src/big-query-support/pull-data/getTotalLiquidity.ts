import { BigQuery, BigQueryInt } from '@google-cloud/bigquery';

import { dollarAggregate } from '../../api/common/dollarAggregate';
import { bqNumericToNumber } from '../utils';

type Args = {
  chainId: number;
  mintsAndBurnsTableId: string;
  bigQuery: BigQuery;
  geckoKey: string;
};

/**
 Get chain total liquidity
 */
export const getChainTotalLiquidity = async ({
  chainId,
  mintsAndBurnsTableId,
  bigQuery,
  geckoKey,
}: Args): Promise<number> => {
  const liquidityQuery = `
    SELECT underlyingToken, sum(notionalDelta) as amount
      FROM \`${mintsAndBurnsTableId}\`
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

  const totalLiquidityInDollars = await dollarAggregate(parsedRows, geckoKey);

  return totalLiquidityInDollars;
};
