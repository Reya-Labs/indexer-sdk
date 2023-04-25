import { SwapEventInfo } from '../../../common/event-parsers/types';
import { getBigQuery } from '../../../global';
import { getTableFullID, secondsToBqDate } from '../../utils';
import { generateSwapRow } from './generateSwapRow';

export const insertNewSwap = async (event: SwapEventInfo): Promise<void> => {
  const bigQuery = getBigQuery();

  const eventTimestamp = (await event.amm.provider.getBlock(event.blockNumber)).timestamp;

  const swapRow = generateSwapRow(event, eventTimestamp);

  const rawSwapRow = `
    \"${swapRow.eventId}\",
    \"${swapRow.vammAddress}\",
    \"${swapRow.ownerAddress}\",
    ${swapRow.tickLower}, 
    ${swapRow.tickUpper}, 
    ${swapRow.variableTokenDelta}, 
    ${swapRow.fixedTokenDeltaUnbalanced},
    ${swapRow.feePaidToLps}, 
    ${swapRow.eventBlockNumber}, 
    \'${secondsToBqDate(swapRow.eventTimestamp)}\', 
    \'${secondsToBqDate(swapRow.rowLastUpdatedTimestamp)}\',
    \'${swapRow.rateOracle}\',
    \'${swapRow.underlyingToken}\',
    \'${swapRow.marginEngineAddress}\',
    ${swapRow.chainId}
  `;

  // build and fire sql query
  const sqlTransactionQuery = `
    INSERT INTO \`${getTableFullID('active_swaps')}\` VALUES (${rawSwapRow});
  `;

  const options = {
    query: sqlTransactionQuery,
    timeoutMs: 100000,
    useLegacySql: false,
  };

  await bigQuery.query(options);
};
