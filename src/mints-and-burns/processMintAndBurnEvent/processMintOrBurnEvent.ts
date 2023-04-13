import { BigQuery } from '@google-cloud/bigquery';

import { pullExistingMintOrBurnRow } from '../../big-query-support';
import { parseMintOrBurnEvent } from '../../common/mints-and-burns/parseMintOrBurnEvent';
import { ExtendedEvent } from '../../common/types';
import { insertNewMintOrBurn } from './insertNewMintOrBurn';

export const processMintOrBurnEvent = async (
  bigQuery: BigQuery,
  event: ExtendedEvent,
): Promise<void> => {
  console.log('Mint Or Burn processing...');

  const eventInfo = parseMintOrBurnEvent(event);

  const eventTimestamp = (await event.getBlock()).timestamp;

  const existingMintOrBurnEvent = await pullExistingMintOrBurnRow(bigQuery, eventInfo.eventId);

  if (existingMintOrBurnEvent === null) {
    await insertNewMintOrBurn(bigQuery, eventInfo, eventTimestamp);
  }
};
