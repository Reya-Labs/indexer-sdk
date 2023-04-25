import { IrsInstanceEventInfo } from '../../../common/event-parsers/types';
import { getTimestampInSeconds } from '../../../common/utils';
import { getBigQuery } from '../../../global';
import { getTableFullID, secondsToBqDate } from '../../utils';

export const insertNewPool = async (event: IrsInstanceEventInfo): Promise<void> => {
  const bigQuery = getBigQuery();

  const eventTimestamp = (await event.getBlock()).timestamp;
  const currentTimestamp = getTimestampInSeconds();

  const rawPoolRow = `
    \"${event.eventId}\",
    ${event.chainId},
    \"${event.factory}\",
    \"${event.vamm}\",
    \"${event.marginEngine}\",

    ${event.blockNumber}, 
    \'${secondsToBqDate(eventTimestamp)}\',
    \'${secondsToBqDate(currentTimestamp)}\',

    \'${secondsToBqDate(event.termStartTimestamp)}\',
    \'${secondsToBqDate(event.termEndTimestamp)}\',

    \"${event.rateOracleID}\",
    ${event.rateOracleIndex},

    ${event.underlyingToken},
    ${event.tokenDecimals}
  `;

  const sqlTransactionQuery = `INSERT INTO \`${getTableFullID('pools')}\` VALUES (${rawPoolRow});`;

  const options = {
    query: sqlTransactionQuery,
    timeoutMs: 100000,
    useLegacySql: false,
  };

  await bigQuery.query(options);
};
