import { BigQuery } from '@google-cloud/bigquery';
import { AMM } from '@voltz-protocol/v1-sdk';
import { ethers } from 'ethers';

import { pullExistingMintOrBurnRow } from '../../big-query-support';
import { parseMintOrBurnEvent } from '../../common/mints-and-burns/parseMintOrBurnEvent';
import { insertNewMintOrBurn } from './insertNewMintOrBurn';

export const processMintOrBurnEvent = async (
  chainId: number,
  bigQuery: BigQuery,
  amm: AMM,
  event: ethers.Event,
  isBurn: boolean
): Promise<void> => {
  console.log('Mint Or Burn processing...');

  const eventInfo = parseMintOrBurnEvent(chainId, amm, event, isBurn);

  const eventTimestamp = (await event.getBlock()).timestamp;

  const existingMintOrBurnEvent = await pullExistingMintOrBurnRow(
    bigQuery,
    eventInfo.eventId
  );

  if (existingMintOrBurnEvent === null) { 

    await insertNewMintOrBurn(bigQuery, eventInfo, eventTimestamp);

  }

};
