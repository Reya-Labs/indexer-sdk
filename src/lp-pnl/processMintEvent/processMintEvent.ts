import { BigQuery } from '@google-cloud/bigquery';
import { AMM } from '@voltz-protocol/v1-sdk';
import { ethers } from 'ethers';
import { pullExistingPositionRow } from '../../big-query-support';
import { parseMintEvent } from '../../common/mints/parseMintEvent';
import { insertNewMintAndNewPosition } from './insertNewMintAndNewPosition';


export const processMintEvent = async (
  bigQuery: BigQuery,
  amm: AMM,
  event: ethers.Event,
): Promise<void> => {

  // todo: needs implementation
  const eventInfo = parseMintEvent(amm, event);

  const eventTimestamp = (await event.getBlock()).timestamp;
  const existingPosition = await pullExistingPositionRow(
    bigQuery,
    eventInfo.vammAddress,
    eventInfo.ownerAddress,
    eventInfo.tickLower,
    eventInfo.tickUpper,
  );

  if (existingPosition) {
    // this position has already performed a swap
    await insertNewMintAndNewPosition(
        bigQuery, amm, eventInfo, eventTimestamp
    );
  } else {
    // to keep things simple, we just need mints to make sure we capture and don't miss any lps
    // don't care about tracking notional liquidity provided by looking through updated mints and burns yet
    return;
  }
};