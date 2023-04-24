import { POSITIONS_TABLE_ID } from '../../common/constants';
import { getBigQuery } from '../../global';
import { TrackedBigQueryPositionRow } from '../pull-data/pullAllPositions';
import { secondsToBqDate } from '../utils';

const CHARACTER_LIMIT = 1_000_000;

export const updatePositions = async (
  processName: string,
  positions: TrackedBigQueryPositionRow[],
): Promise<void> => {
  const bigQuery = getBigQuery();

  const updates = positions
    .map(({ position, added, modified }) => {
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
    })
    .filter((u) => u.length > 0);

  if (updates.length === 0) {
    return;
  }

  const queries: string[] = [];

  updates.forEach((u) => {
    if (queries.length === 0 || queries[queries.length - 1].length + u.length > CHARACTER_LIMIT) {
      queries.push(u);
    } else {
      queries[queries.length - 1] = queries[queries.length - 1].concat(u);
    }
  });

  console.log(
    `${processName}: Sending ${queries.length} queries to BigQuery (updating ${updates.length} positions)...`,
  );

  for (const query of queries) {
    const options = {
      query,
      timeoutMs: 100000,
      useLegacySql: false,
    };

    await bigQuery.query(options);
  }
};
