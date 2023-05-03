import { MintOrBurnEventInfo } from '../../../common/event-parsers/types';
import { getProvider } from '../../../common/provider/getProvider';
import { getTimestampInSeconds } from '../../../common/utils';
import { getBigQuery } from '../../../global';
import { getTableFullID, secondsToBqDate } from '../../utils';

export const insertNewMintOrBurn = async (event: MintOrBurnEventInfo): Promise<void> => {
  const bigQuery = getBigQuery();
  const provider = getProvider(event.chainId);

  const eventTimestamp = (await provider.getBlock(event.blockNumber)).timestamp;
  const currentTimestamp = getTimestampInSeconds();

  const rawMintOrBurnRow = `
    \"${event.eventId}\",
    \"${event.vammAddress}\",
    \"${event.ownerAddress}\",
    ${event.tickLower}, 
    ${event.tickUpper}, 
    ${event.notionalDelta}, 
    ${event.blockNumber}, 
    \'${secondsToBqDate(eventTimestamp)}\', 
    \'${secondsToBqDate(currentTimestamp)}\',
    \'${event.rateOracle}\',
    \'${event.underlyingToken}\',
    \'${event.marginEngineAddress}\',
    ${event.chainId}
  `;

  const sqlTransactionQuery = `INSERT INTO \`${getTableFullID(
    'mints_and_burns',
  )}\` VALUES (${rawMintOrBurnRow});`;

  const options = {
    query: sqlTransactionQuery,
    timeoutMs: 100000,
    useLegacySql: false,
  };

  await bigQuery.query(options);
};
