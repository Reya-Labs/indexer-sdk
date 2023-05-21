import { MarginUpdateEventInfo } from '../../../common/event-parsers/types';
import { getTimestampInSeconds } from '../../../common/utils';
import { getBigQuery } from '../../../global';
import { getTableFullID, secondsToBqDate } from '../../utils';

export const insertNewMarginUpdate = async (event: MarginUpdateEventInfo): Promise<void> => {
  const bigQuery = getBigQuery();

  const eventTimestamp = (await event.getBlock()).timestamp;
  const currentTimestamp = getTimestampInSeconds();

  const rawMarginUpdateRow = `
    \"${event.eventId}\",
    \"${event.vammAddress}\",
    \"${event.ownerAddress}\",
    ${event.tickLower}, 
    ${event.tickUpper}, 
    ${event.marginDelta},
    ${event.blockNumber}, 
    \'${secondsToBqDate(eventTimestamp)}\', 
    \'${secondsToBqDate(currentTimestamp)}\',
    \'${event.rateOracle}\',
    \'${event.underlyingToken}\',
    \'${event.marginEngineAddress}\',
    ${event.chainId}
  `;

  // build and fire sql query
  const sqlTransactionQuery = `
    INSERT INTO \`${getTableFullID('margin_updates')}\` VALUES (${rawMarginUpdateRow});
  `;

  const options = {
    query: sqlTransactionQuery,
    timeoutMs: 100000,
    useLegacySql: false,
  };

  await bigQuery.query(options);
};
