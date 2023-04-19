import { BigQuery } from '@google-cloud/bigquery';

import { pullExistingMintOrBurnRow } from '../../big-query-support';
import { insertNewMintOrBurn } from '../../big-query-support/push-data/insertNewMintOrBurn';
import { parseMintOrBurnEvent } from '../../common/event-parsers/parseMintOrBurnEvent';
import { ExtendedEvent } from '../../common/types';

export const processMintOrBurnEvent = async (
  bigQuery: BigQuery,
  event: ExtendedEvent,
): Promise<void> => {
  const eventInfo = parseMintOrBurnEvent(event);

  const existingMintOrBurnEvent = await pullExistingMintOrBurnRow(bigQuery, eventInfo.eventId);

  if (existingMintOrBurnEvent) {
    // console.log('Mint or Burn already processed. Skipped.');
    return;
  }

  await insertNewMintOrBurn(bigQuery, eventInfo);
};
