import { BigQuery } from '@google-cloud/bigquery';

import { pullExistingMintOrBurnRow } from '../../big-query-support';
import { parseMintOrBurnEvent } from '../../common/mints-and-burns/parseMintOrBurnEvent';
import { ExtendedEvent } from '../../common/types';
import { insertNewMintOrBurn } from './insertNewMintOrBurn';

export const processMintOrBurnEvent = async (
  chainId: number,
  bigQuery: BigQuery,
  event: ExtendedEvent,
  isBurn: boolean,
): Promise<void> => {
  console.log('Mint Or Burn processing...');

  const eventInfo = parseMintOrBurnEvent(chainId, event, isBurn);

  const eventTimestamp = (await event.getBlock()).timestamp;

  const existingMintOrBurnEvent = await pullExistingMintOrBurnRow(bigQuery, eventInfo.eventId);

  console.log("here3");

  if (existingMintOrBurnEvent === null) {
    await insertNewMintOrBurn(bigQuery, eventInfo, eventTimestamp);
  }
};
