import { MINTS_BURNS_TABLE_ID } from '../../common/constants';
import { MintOrBurnEventInfo } from '../../common/event-parsers/types';
import { getBigQuery } from '../../global';
import { secondsToBqDate } from '../utils';
import { generateMintOrBurnRow } from './generateMintOrBurnRow';

export const insertNewMintOrBurn = async (event: MintOrBurnEventInfo): Promise<void> => {
  const bigQuery = getBigQuery();

  const eventTimestamp = (await event.amm.provider.getBlock(event.blockNumber)).timestamp;

  const mintOrBurnRow = generateMintOrBurnRow(event, eventTimestamp);

  const rawMintOrBurnRow = `
    \"${mintOrBurnRow.eventId}\",
    \"${mintOrBurnRow.vammAddress}\",
    \"${mintOrBurnRow.ownerAddress}\",
    ${mintOrBurnRow.tickLower}, 
    ${mintOrBurnRow.tickUpper}, 
    ${mintOrBurnRow.notionalDelta}, 
    ${mintOrBurnRow.eventBlockNumber}, 
    \'${secondsToBqDate(mintOrBurnRow.eventTimestamp)}\', 
    \'${secondsToBqDate(mintOrBurnRow.rowLastUpdatedTimestamp)}\',
    \'${mintOrBurnRow.rateOracle}\',
    \'${mintOrBurnRow.underlyingToken}\',
    \'${mintOrBurnRow.marginEngineAddress}\',
    ${mintOrBurnRow.chainId}
  `;

  const sqlTransactionQuery = `INSERT INTO \`${MINTS_BURNS_TABLE_ID}\` VALUES (${rawMintOrBurnRow});`;

  const options = {
    query: sqlTransactionQuery,
    timeoutMs: 100000,
    useLegacySql: false,
  };

  await bigQuery.query(options);
};
