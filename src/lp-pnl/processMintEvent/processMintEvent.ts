import { BigQuery } from '@google-cloud/bigquery';

import { pullExistingPositionRow } from '../../big-query-support';
import { parseMintOrBurnEvent } from '../../common/mints-and-burns/parseMintOrBurnEvent';
import { ExtendedEvent } from '../../common/types';
import { insertNewMintAndNewPosition } from './insertNewMintAndNewPosition';

export const processMintEvent = async (bigQuery: BigQuery, event: ExtendedEvent): Promise<void> => {
  console.log('Mint processing...');

  const eventInfo = parseMintOrBurnEvent(event);

  const existingPosition = await pullExistingPositionRow(
    bigQuery,
    eventInfo.vammAddress,
    eventInfo.ownerAddress,
    eventInfo.tickLower,
    eventInfo.tickUpper,
  );

  if (existingPosition) {
    // this position has already performed a mint
    return;
  } else {
    // to keep things simple, we just need mints to make sure we capture and don't miss any lps
    // don't care about tracking notional liquidity provided by looking through updated mints and burns yet

    const eventTimestamp = (await event.getBlock()).timestamp;

    await insertNewMintAndNewPosition(bigQuery, eventInfo, eventTimestamp);
  }
};
