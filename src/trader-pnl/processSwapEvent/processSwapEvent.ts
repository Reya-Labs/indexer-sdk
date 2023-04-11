import { BigQuery } from '@google-cloud/bigquery';
import { AMM } from '@voltz-protocol/v1-sdk';
import { ethers } from 'ethers';

import { pullExistingPositionRow, pullExistingSwapRow } from '../../big-query-support';
import { parseSwapEvent } from '../../common/swaps/parseSwapEvent';
import { insertNewSwapAndNewPosition } from './insertNewSwapAndNewPosition';
import { insertNewSwapAndUpdateExistingPosition } from './insertNewSwapAndUpdateExistingPosition';

export const processSwapEvent = async (
  bigQuery: BigQuery,
  amm: AMM,
  event: ethers.Event,
): Promise<void> => {
  const eventInfo = parseSwapEvent(amm, event);

  const swapRow = await pullExistingSwapRow(bigQuery, eventInfo.eventId);

  if (swapRow) {
    console.log('Swap already processed. Skipped.');
    // swap already processed, skip
    return;
  }

  const eventTimestamp = (await event.getBlock()).timestamp;

  // check if a position already exists in the positions table
  const existingPosition = await pullExistingPositionRow(
    bigQuery,
    eventInfo.vammAddress,
    eventInfo.ownerAddress,
    eventInfo.tickLower,
    eventInfo.tickUpper,
  );

  if (existingPosition) {
    // this position has already performed a swap
    await insertNewSwapAndUpdateExistingPosition(
      bigQuery,
      amm,
      eventInfo,
      eventTimestamp,
      existingPosition,
    );
  } else {
    // this is the first swap of the position
    await insertNewSwapAndNewPosition(bigQuery, amm, eventInfo, eventTimestamp);
  }
};
