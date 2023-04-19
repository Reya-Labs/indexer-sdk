import { BigQuery } from '@google-cloud/bigquery';

import { POSITIONS_TABLE_ID } from '../../common/constants';
import { MintOrBurnEventInfo } from '../../common/event-parsers/types';
import { secondsToBqDate } from '../utils';
import { generateLpPositionRow } from './generateLpPositionRow';

export const insertNewMintAndNewPosition = async (
  bigQuery: BigQuery,
  eventInfo: MintOrBurnEventInfo,
): Promise<void> => {
  // console.log('Inserting new LP position following a mint...');

  // generate position row
  const positionRow = generateLpPositionRow(eventInfo);

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
    \'${secondsToBqDate(positionRow.lastUpdatedBlockNumber)}\',
    ${positionRow.notionalLiquidityProvided},                
    ${positionRow.realizedPnLFromFeesCollected},
    ${positionRow.netMarginDeposited},
    ${positionRow.rateOracleIndex},
    \'${secondsToBqDate(positionRow.rowLastUpdatedTimestamp)}\',
    ${positionRow.fixedTokenBalance},
    ${positionRow.variableTokenBalance},
    \'${secondsToBqDate(positionRow.positionInitializationBlockNumber)}\',
    \'${positionRow.rateOracle}\',
    \'${positionRow.underlyingToken}\',
    ${positionRow.chainId},
    ${positionRow.cashflowLiFactor},
    ${positionRow.cashflowTimeFactor},
    ${positionRow.cashflowFreeTerm},
    ${positionRow.liquidity},
    ${positionRow.tickPrevious}
  `;

  // build and fire sql query
  const sqlTransactionQuery = `INSERT INTO \`${POSITIONS_TABLE_ID}\` VALUES(${rawPositionRow});`;

  const options = {
    query: sqlTransactionQuery,
    timeoutMs: 100000,
    useLegacySql: false,
  };

  await bigQuery.query(options);

  // console.log(
  //   `Inserted a new LP position (${positionRow.ownerAddress},[${positionRow.tickLower},${positionRow.tickUpper}]) in AMM ${eventInfo.amm.id}, chain ID ${eventInfo.chainId}`,
  // );
};
