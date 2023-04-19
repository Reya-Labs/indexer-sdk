import { BigQuery } from '@google-cloud/bigquery';

import { MINTS_BURNS_TABLE_ID } from '../../common/constants';
import { MintOrBurnEventInfo } from '../../common/event-parsers/types';
import { secondsToBqDate } from '../utils';
import { generateMintOrBurnRow } from './generateMintOrBurnRow';

export const insertNewMintOrBurn = async (
  bigQuery: BigQuery,
  eventInfo: MintOrBurnEventInfo,
): Promise<void> => {
  // console.log('Inserting a new mint or burn');
  const mintOrBurnRow = generateMintOrBurnRow(eventInfo);

  const rawMintOrBurnRow = `
    \"${mintOrBurnRow.eventId}\",
    \"${mintOrBurnRow.vammAddress}\",
    \"${mintOrBurnRow.ownerAddress}\",
    ${mintOrBurnRow.tickLower}, 
    ${mintOrBurnRow.tickUpper}, 
    ${mintOrBurnRow.notionalDelta}, 
    \'${secondsToBqDate(mintOrBurnRow.eventTimestamp)}\', 
    \'${secondsToBqDate(mintOrBurnRow.rowLastUpdatedTimestamp)}\',
    \'${mintOrBurnRow.rateOracle}\',
    \'${mintOrBurnRow.underlyingToken}\',
    \'${mintOrBurnRow.marginEngineAddress}\',
    ${mintOrBurnRow.chainId}
  `;

  // build and fire sql query
  // todo: get rid of transaction in here
  const sqlTransactionQuery = `
    BEGIN 
      BEGIN TRANSACTION;
        INSERT INTO \`${MINTS_BURNS_TABLE_ID}\` VALUES (${rawMintOrBurnRow});   
      COMMIT TRANSACTION;
    END;
  `;

  const options = {
    query: sqlTransactionQuery,
    timeoutMs: 100000,
    useLegacySql: false,
  };

  await bigQuery.query(options);

  // console.log(`Inserted new mint or burn with eventId: ${eventInfo.eventId}`);
};
