import { BigQuery } from '@google-cloud/bigquery';

import { pullExistingPositionRow, pullExistingSwapRow } from '../../big-query-support';
import { parseSwapEvent } from '../../common/swaps/parseSwapEvent';
import { ExtendedEvent } from '../../common/types';
import { insertNewSwapAndNewPosition } from './insertNewSwapAndNewPosition';
import { insertNewSwapAndUpdateExistingPosition } from './insertNewSwapAndUpdateExistingPosition';

export const processSwapEvent = async (bigQuery: BigQuery, event: ExtendedEvent): Promise<void> => {
  const eventInfo = parseSwapEvent(event);

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
    chainId,
    eventInfo.vammAddress,
    eventInfo.ownerAddress,
    eventInfo.tickLower,
    eventInfo.tickUpper,
  );

  if (existingPosition) {
    // this position has already performed a swap
    await insertNewSwapAndUpdateExistingPosition(
      bigQuery,
      event.amm,
      eventInfo,
      eventTimestamp,
      existingPosition,
    );
  } else {
    // this is the first swap of the position
    await insertNewSwapAndNewPosition(bigQuery, event.amm, eventInfo, eventTimestamp);
  }
};
