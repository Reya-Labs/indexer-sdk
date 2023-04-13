import { DATASET_ID, POSITIONS_TABLE_ID, PROJECT_ID } from '../common';
import { BigQueryPositionRow } from '.';
import { secondsToBqDate } from './utils';

export const generateLpPositionUpdatesQuery = (lpPositionRows: BigQueryPositionRow[]): string => {
  const positionTableId = `${PROJECT_ID}.${DATASET_ID}.${POSITIONS_TABLE_ID}`;

  const query = lpPositionRows
    .map((positionRow) => {
      return `
      UPDATE \`${positionTableId}\`
        SET marginEngineAddress=\"${positionRow.marginEngineAddress}\",
            realizedPnLFromSwaps=${positionRow.realizedPnLFromSwaps},
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
    })
    .join('\n');

  return query;
};
