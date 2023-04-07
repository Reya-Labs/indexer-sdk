import { BigQuery } from '@google-cloud/bigquery';
import { AMM } from '@voltz-protocol/v1-sdk';
import { ethers } from 'ethers';

import { pullExistingPositionRow, pullExistingSwapRow } from '../../big-query-support';
import { MIN_ETH_NOTIONAL, MIN_USD_NOTIONAL } from '../../common';
import { insertNewSwapAndNewPosition } from './insertNewSwapAndNewPosition';
import { insertNewSwapAndUpdateExistingPosition } from './insertNewSwapAndUpdateExistingPosition';
import { parseSwapEvent } from './parseSwapEvent';

function shouldProcessSwapEvent(isETH: boolean, notionalExecuted: number): boolean {
  let shouldProcess = true;

  if (isETH) {
    if (Math.abs(notionalExecuted) < MIN_ETH_NOTIONAL) {
      shouldProcess = false;
    }
  } else {
    if (Math.abs(notionalExecuted) < MIN_USD_NOTIONAL) {
      shouldProcess = false;
    }
  }

  return shouldProcess;
}

export const processSwapEvent = async (
  bigQuery: BigQuery,
  amm: AMM,
  event: ethers.Event,
): Promise<void> => {
  const eventInfo = parseSwapEvent(amm, event);
  const shouldProcess = shouldProcessSwapEvent(amm.isETH, eventInfo.notionalLocked);

  if (!shouldProcess) {
    // swap should not be processed, skip
    return;
  }

  const swapRow = await pullExistingSwapRow(bigQuery, eventInfo.eventId);

  if (swapRow) {
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
