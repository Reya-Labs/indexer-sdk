import { BigQuery } from '@google-cloud/bigquery';

import { BigQueryPositionRow, pullExistingPositionRow } from '../../big-query-support';
import { MintOrBurnEventInfo } from '../../common/event-parsers';
import { gPositionInsertQueryMint } from './gPositionInsertQueryMint';
import { gPositionUpdateQueryMintBurn } from './gPositionUpdateQueryMintBurn';

export const processMintOrBurnEventLpSpeed = async (
  bigQuery: BigQuery,
  eventInfo: MintOrBurnEventInfo,
): Promise<void> => {
  const existingPosition: BigQueryPositionRow | null = await pullExistingPositionRow(
    bigQuery,
    eventInfo.chainId,
    eventInfo.vammAddress,
    eventInfo.ownerAddress,
    eventInfo.tickLower,
    eventInfo.tickUpper,
  );

  let query = ``;

  if (existingPosition) {
    query = gPositionUpdateQueryMintBurn(existingPosition, eventInfo);
  } else {
    query = gPositionInsertQueryMint(eventInfo);
  }

  const options = {
    query: query,
    timeoutMs: 100000,
    useLegacySql: false,
  };

  await bigQuery.query(options);
};
