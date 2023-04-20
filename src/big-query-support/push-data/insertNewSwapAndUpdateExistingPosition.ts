import { AMM } from '@voltz-protocol/v1-sdk';

import { ACTIVE_SWAPS_TABLE_ID, POSITIONS_TABLE_ID } from '../../common/constants';
import { SwapEventInfo } from '../../common/event-parsers/types';
import { getLiquidityIndex } from '../../common/services/getLiquidityIndex';
import { getBigQuery } from '../../global';
import { BigQueryPositionRow } from '../pull-data/types';
import { secondsToBqDate } from '../utils';
import { generatePositionRow } from './generatePositionRow';
import { generateSwapRow } from './generateSwapRow';

export const insertNewSwapAndUpdateExistingPosition = async (
  amm: AMM,
  eventInfo: SwapEventInfo,
  eventTimestamp: number,
  existingPosition: BigQueryPositionRow,
): Promise<void> => {
  const bigQuery = getBigQuery();

  const swapRow = generateSwapRow(eventInfo, eventTimestamp);

  const liquidityIndexAtRootEvent = await getLiquidityIndex(
    eventInfo.chainId,
    amm.provider,
    amm.marginEngineAddress,
    eventInfo.blockNumber,
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
    INSERT INTO \`${ACTIVE_SWAPS_TABLE_ID}\` VALUES (${rawSwapRow});
                
    UPDATE \`${POSITIONS_TABLE_ID}\`
      SET realizedPnLFromSwaps=${positionRow.realizedPnLFromSwaps},
          realizedPnLFromFeesPaid=${positionRow.realizedPnLFromFeesPaid},
          netNotionalLocked=${positionRow.netNotionalLocked},
          netFixedRateLocked=${positionRow.netFixedRateLocked},
          lastUpdatedBlockNumber=\'${secondsToBqDate(positionRow.lastUpdatedBlockNumber)}\',
          notionalLiquidityProvided=${positionRow.notionalLiquidityProvided},
          realizedPnLFromFeesCollected=${positionRow.realizedPnLFromFeesCollected},
          netMarginDeposited=${positionRow.netMarginDeposited},
          rowLastUpdatedTimestamp=\'${secondsToBqDate(positionRow.rowLastUpdatedTimestamp)}\',
          fixedTokenBalance=${positionRow.fixedTokenBalance},
          variableTokenBalance=${positionRow.variableTokenBalance},
          cashflowLiFactor=${positionRow.cashflowLiFactor},
          cashflowTimeFactor=${positionRow.cashflowTimeFactor},
          cashflowFreeTerm=${positionRow.cashflowFreeTerm},
          liquidity=${positionRow.liquidity},
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
};
