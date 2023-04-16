import { BigQuery } from '@google-cloud/bigquery';

import { pullExistingMintOrBurnRow } from '../../big-query-support';
import { parseMintOrBurnEvent } from '../../common/event-parsers/parseMintOrBurnEvent';
import { ExtendedEvent } from '../../common/types';
import { insertNewMintOrBurn } from './insertNewMintOrBurn';

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
