import { POSITIONS_TABLE_ID } from '../../common/constants';
import { getBigQuery } from '../../global';
import { TrackedBigQueryPositionRow } from '../pull-data/pullAllPositions';
import { secondsToBqDate } from '../utils';

export const updatePositions = async (positions: TrackedBigQueryPositionRow[]): Promise<void> => {
  const bigQuery = getBigQuery();
  const updates = positions.map(({ position, added, modified }) => {
    if (added) {
      const rawPositionRow = `
            \"${position.marginEngineAddress}\",
            \"${position.vammAddress}\",
            \"${position.ownerAddress}\",
            ${position.tickLower},
            ${position.tickUpper},
            ${position.realizedPnLFromSwaps},
            ${position.realizedPnLFromFeesPaid},
            ${position.netNotionalLocked},
            ${position.netFixedRateLocked},
            ${position.lastUpdatedBlockNumber},
            ${position.notionalLiquidityProvided},                
            ${position.realizedPnLFromFeesCollected},
            ${position.netMarginDeposited},
            ${position.rateOracleIndex},
            \'${secondsToBqDate(position.rowLastUpdatedTimestamp)}\',
            ${position.fixedTokenBalance},
            ${position.variableTokenBalance},
            ${position.positionInitializationBlockNumber},
            \'${position.rateOracle}\',
            \'${position.underlyingToken}\',
            ${position.chainId},
            ${position.cashflowLiFactor},
            ${position.cashflowTimeFactor},
            ${position.cashflowFreeTerm},
            ${position.liquidity}
        `;

      return `INSERT INTO \`${POSITIONS_TABLE_ID}\` VALUES(${rawPositionRow});`;
    }

    if (modified) {
      return `
            UPDATE \`${POSITIONS_TABLE_ID}\`
            SET realizedPnLFromSwaps=${position.realizedPnLFromSwaps},
                realizedPnLFromFeesPaid=${position.realizedPnLFromFeesPaid},
                netNotionalLocked=${position.netNotionalLocked},
                netFixedRateLocked=${position.netFixedRateLocked},
                lastUpdatedBlockNumber=${position.lastUpdatedBlockNumber},
                notionalLiquidityProvided=${position.notionalLiquidityProvided},
                realizedPnLFromFeesCollected=${position.realizedPnLFromFeesCollected},
                netMarginDeposited=${position.netMarginDeposited},
                rowLastUpdatedTimestamp=\'${secondsToBqDate(position.rowLastUpdatedTimestamp)}\', 
                fixedTokenBalance=${position.fixedTokenBalance}, 
                variableTokenBalance=${position.variableTokenBalance},
                cashflowLiFactor=${position.cashflowLiFactor},
                cashflowTimeFactor=${position.cashflowTimeFactor},
                cashflowFreeTerm=${position.cashflowFreeTerm},
                liquidity=${position.liquidity}
            WHERE chainId=${position.chainId} AND
                    vammAddress=\"${position.vammAddress}\" AND 
                    ownerAddress=\"${position.ownerAddress}\" AND
                    tickLower=${position.tickLower} AND 
                    tickUpper=${position.tickUpper};
        `;
    }

    return ``;
  });
  if (updates.every((u) => u.length === 0)) {
    console.log(`No position to update.`);
    return;
  }

  const query = updates.join(`\n`);

  const options = {
    query,
    timeoutMs: 100000,
    useLegacySql: false,
  };

  await bigQuery.query(options);
};
