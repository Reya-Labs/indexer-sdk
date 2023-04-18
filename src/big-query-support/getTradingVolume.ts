import { BigQuery, BigQueryInt } from '@google-cloud/bigquery';

import { dollarAggregate } from '../api/common/dollarAggregate';
import { bqNumericToNumber } from './utils';

type Args = {
  chainId: number;
  activeSwapsTableId: string;
  bigQuery: BigQuery;
  geckoKey: string;
};

/**
 Get trading volume over last 30 days on given chain
 */
export const getChainTradingVolume = async ({
  chainId,
  activeSwapsTableId,
  bigQuery,
  geckoKey,
}: Args): Promise<number> => {
  const volumeQuery = `
        SELECT underlyingToken, sum(abs(variableTokenDelta)) as amount
        FROM \`${activeSwapsTableId}\`
        
        WHERE (eventTimestamp > TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 30 DAY)) 
        AND (chainId=${chainId})
        
        GROUP BY underlyingToken
    `;

  const options = {
    query: volumeQuery,
  };

  const [rows] = await bigQuery.query(options);

  if (!rows || rows.length === 0) {
    return 0;
  }

  const parsedRows = rows.map((row: {
    underlyingToken: string;
    amount: BigQueryInt;
  }) => ({
    underlyingToken: row.underlyingToken,
    amount: bqNumericToNumber(row.amount),
  }));

  const volume30DayInDollars = await dollarAggregate(parsedRows, geckoKey);
  
  return volume30DayInDollars;
};
