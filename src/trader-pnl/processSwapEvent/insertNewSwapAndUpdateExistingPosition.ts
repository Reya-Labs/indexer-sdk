import { BigQuery } from '@google-cloud/bigquery';
import { AMM } from '@voltz-protocol/v1-sdk';

import { BigQueryPositionRow } from '../../big-query-support';
import { secondsToBqDate } from '../../big-query-support/utils';
import { getLiquidityIndex, POSITIONS_TABLE_ID, SWAPS_TABLE_ID } from '../../common';
import { SwapEventInfo } from '../../common/event-parsers/parseSwapEvent';
import { generatePositionRow } from '../../common/swaps/generatePositionRow';
import { generateSwapRow } from './generateSwapRow';

export const insertNewSwapAndUpdateExistingPosition = async (
  bigQuery: BigQuery,
  amm: AMM,
  eventInfo: SwapEventInfo,
  eventTimestamp: number,
  existingPosition: BigQueryPositionRow,
): Promise<void> => {
  // console.log('Inserting new active swap and updating position following swap...');

  const swapRow = generateSwapRow(eventInfo, eventTimestamp);

  const liquidityIndexAtRootEvent = await getLiquidityIndex(
    eventInfo.chainId,
    amm.provider,
    amm.marginEngineAddress,
    eventInfo.eventBlockNumber,
  );

  const positionRow = generatePositionRow(
    amm,
    eventInfo,
    eventTimestamp,
    existingPosition,
    liquidityIndexAtRootEvent,
  );

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

  const sqlTransactionQuery = `
    INSERT INTO \`${SWAPS_TABLE_ID}\` VALUES (${rawSwapRow});
                
    UPDATE \`${POSITIONS_TABLE_ID}\`
      SET realizedPnLFromSwaps=${positionRow.realizedPnLFromSwaps},
          realizedPnLFromFeesPaid=${positionRow.realizedPnLFromFeesPaid},
          netNotionalLocked=${positionRow.netNotionalLocked},
          netFixedRateLocked=${positionRow.netFixedRateLocked},
          lastUpdatedTimestamp=\'${secondsToBqDate(positionRow.lastUpdatedTimestamp)}\',
          notionalLiquidityProvided=${positionRow.notionalLiquidityProvided},
          realizedPnLFromFeesCollected=${positionRow.realizedPnLFromFeesCollected},
          netMarginDeposited=${positionRow.netMarginDeposited},
          rowLastUpdatedTimestamp=\'${secondsToBqDate(positionRow.rowLastUpdatedTimestamp)}\',
          fixedTokenBalance=${positionRow.fixedTokenBalance},
          variableTokenBalance=${positionRow.variableTokenBalance},
          cashflowLiFactor=${positionRow.cashflowLiFactor},
          cashflowTimeFactor=${positionRow.cashflowTimeFactor},
          cashflowFreeTerm=${positionRow.cashflowFreeTerm}
          WHERE chainId=${positionRow.chainId} AND 
                vammAddress=\"${positionRow.vammAddress}\" AND 
                ownerAddress=\"${positionRow.ownerAddress}\" AND 
                tickLower=${positionRow.tickLower} AND 
                tickUpper=${positionRow.tickUpper};
  `;

  const options = {
    query: sqlTransactionQuery,
    timeoutMs: 100000,
    useLegacySql: false,
  };

  await bigQuery.query(options);

  // console.log(
  //   `Inserted new swap with eventId ${eventInfo.eventId} and updated LP position (${positionRow.ownerAddress},[${positionRow.tickLower},${positionRow.tickUpper}]) in AMM ${amm.id}, chain ID ${eventInfo.chainId}`,
  // );
};
