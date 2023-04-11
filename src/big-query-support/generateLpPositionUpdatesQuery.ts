import { BigQueryPositionRow } from ".";
import { DATASET_ID, POSITIONS_TABLE_ID, PROJECT_ID } from '../common';


export const generateLpPositionUpdatesQuery = (lpPositionRows: BigQueryPositionRow[]): string => {
 
    let query = ``;
    const positionTableId = `${PROJECT_ID}.${DATASET_ID}.${POSITIONS_TABLE_ID}`;

    for (let i=0; i < lpPositionRows.length; i++) {

        const positionRow = lpPositionRows[i];
        
        const subqueryForRow = `
        UPDATE \`${positionTableId}\`
          SET marginEngineAddress=\"${positionRow.marginEngineAddress}\",
            realizedPnLFromSwaps=${positionRow.realizedPnLFromSwaps},realizedPnLFromFeesPaid=${positionRow.realizedPnLFromFeesPaid},
            netNotionalLocked=${positionRow.netNotionalLocked},netFixedRateLocked=${positionRow.netFixedRateLocked},
            lastUpdatedTimestamp=\'${positionRow.lastUpdatedTimestamp}\',notionalLiquidityProvided=${positionRow.notionalLiquidityProvided},
            realizedPnLFromFeesCollected=${positionRow.realizedPnLFromFeesCollected},netMarginDeposited=${positionRow.netMarginDeposited},
            rowLastUpdatedTimestamp=\'${positionRow.rowLastUpdatedTimestamp}\', fixedTokenBalance=${positionRow.fixedTokenBalance}, variableTokenBalance=${positionRow.variableTokenBalance}
          WHERE vammAddress=\"${positionRow.vammAddress}\" AND ownerAddress=\"${positionRow.ownerAddress}\" AND tickLower=${positionRow.tickLower} AND tickUpper=${positionRow.tickUpper};
        `;
    
        query = `
          ${query}
          ${subqueryForRow}
        `;

    }


    return query;
    
};
