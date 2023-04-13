import { BigQuery } from '@google-cloud/bigquery';

import { BigQueryMintOrBurnRow } from '../../big-query-support';
import { secondsToBqDate } from '../../big-query-support/utils';
import { DATASET_ID, MINTS_BURNS_TABLE_ID,PROJECT_ID } from '../../common';
import { MintOrBurnEventInfo } from '../../common/mints-and-burns/parseMintOrBurnEvent';
import { generateMintOrBurnRow } from './generateMintOrBurnRow';

export const insertNewMintOrBurn = async (
  bigQuery: BigQuery,
  eventInfo: MintOrBurnEventInfo,
  eventTimestamp: number,
): Promise<void> => {
  console.log('Inserting a new mint or burn');
  const mintOrBurnRow: BigQueryMintOrBurnRow = generateMintOrBurnRow(eventInfo, eventTimestamp);

  const mintOrBurnTableId = `${PROJECT_ID}.${DATASET_ID}.${MINTS_BURNS_TABLE_ID}`;

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
  const sqlTransactionQuery = `
    BEGIN 
      BEGIN TRANSACTION;
        INSERT INTO \`${mintOrBurnTableId}\` VALUES (${rawMintOrBurnRow});   
      COMMIT TRANSACTION;
    END;
  `;

  const options = {
    query: sqlTransactionQuery,
    timeoutMs: 100000,
    useLegacySql: false,
  };

  await bigQuery.query(options);

  console.log(
    `Inserted new mint or burn with eventId: ${eventInfo.eventId}`,
  );
};
