import { BigQuery } from '@google-cloud/bigquery';
import { AMM } from '@voltz-protocol/v1-sdk';

import { secondsToBqDate } from '../../big-query-support/utils';
import {
  getLiquidityIndex,
  POSITIONS_TABLE_ID,
  SWAPS_TABLE_ID,
} from '../../common';
import { generatePositionRow } from '../../common/swaps/generatePositionRow';
import { SwapEventInfo } from '../../common/swaps/parseSwapEvent';
import { generateSwapRow } from './generateSwapRow';

export const insertNewSwapAndNewPosition = async (
  bigQuery: BigQuery,
  amm: AMM,
  eventInfo: SwapEventInfo,
  eventTimestamp: number,
): Promise<void> => {
  console.log('Inserting new active swap and new position following swap...');

  // generate swap row
  const swapRow = generateSwapRow(eventInfo, eventTimestamp);

  const rawSwapRow = `
    \"${swapRow.eventId}\",
    \"${swapRow.vammAddress}\",
    \"${swapRow.ownerAddress}\",
    ${swapRow.tickLower}, 
    ${swapRow.tickUpper}, 
    ${swapRow.variableTokenDelta}, 
    ${swapRow.fixedTokenDeltaUnbalanced},
    ${swapRow.feePaidToLps}, 
    \'${secondsToBqDate(swapRow.eventTimestamp)}\', 
    \'${secondsToBqDate(swapRow.rowLastUpdatedTimestamp)}\',
    \'${swapRow.rateOracle}\',
    \'${swapRow.underlyingToken}\',
    \'${swapRow.marginEngineAddress}\',
    ${swapRow.chainId}
  `;

  const liquidityIndexAtRootEvent = await getLiquidityIndex(
    eventInfo.chainId,
    amm.provider,
    amm.marginEngineAddress,
    eventInfo.eventBlockNumber,
  );

  // generate position row
  const positionRow = generatePositionRow(
    amm,
    eventInfo,
    eventTimestamp,
    null,
    liquidityIndexAtRootEvent,
  );

  const rawPositionRow = `
    \"${positionRow.marginEngineAddress}\",
    \"${positionRow.vammAddress}\",
    \"${positionRow.ownerAddress}\",
    ${positionRow.tickLower},
    ${positionRow.tickUpper},
    ${positionRow.realizedPnLFromSwaps},
    ${positionRow.realizedPnLFromFeesPaid},
    ${positionRow.netNotionalLocked},
    ${positionRow.netFixedRateLocked},
    \'${secondsToBqDate(positionRow.lastUpdatedTimestamp)}\',
    ${positionRow.notionalLiquidityProvided},                
    ${positionRow.realizedPnLFromFeesCollected},
    ${positionRow.netMarginDeposited},
    ${positionRow.rateOracleIndex},
    \'${secondsToBqDate(positionRow.rowLastUpdatedTimestamp)}\',
    ${positionRow.fixedTokenBalance},
    ${positionRow.variableTokenBalance},
    \'${secondsToBqDate(positionRow.positionInitializationTimestamp)}\',
    \'${positionRow.rateOracle}\',
    \'${positionRow.underlyingToken}\',
    ${positionRow.chainId},
    ${positionRow.cashflowLiFactor},
    ${positionRow.cashflowTimeFactor},
    ${positionRow.cashflowFreeTerm}
  `;

  // build and fire sql query
  const sqlTransactionQuery = `
    INSERT INTO \`${SWAPS_TABLE_ID}\` VALUES (${rawSwapRow});
    INSERT INTO \`${POSITIONS_TABLE_ID}\` VALUES(${rawPositionRow});          
  `;

  const options = {
    query: sqlTransactionQuery,
    timeoutMs: 100000,
    useLegacySql: false,
  };

  await bigQuery.query(options);

  console.log(
    `Inserted new swap with eventId ${eventInfo.eventId} and inserted a new LP position (${positionRow.ownerAddress},[${positionRow.tickLower},${positionRow.tickUpper}]) in AMM ${amm.id}, chain ID ${eventInfo.chainId}`,
  );
};
