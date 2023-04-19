import { BigQuery } from '@google-cloud/bigquery';

import { pullExistingPositionRow } from '../../big-query-support/pull-data/pullExistingPositionRow';
import { pullExistingSwapRow } from '../../big-query-support/pull-data/pullExistingSwapRow';
import { insertNewSwapAndNewPosition } from '../../big-query-support/push-data/insertNewSwapAndNewPosition';
import { insertNewSwapAndUpdateExistingPosition } from '../../big-query-support/push-data/insertNewSwapAndUpdateExistingPosition';
import { parseSwapEvent } from '../../common/event-parsers/parseSwapEvent';
import { ExtendedEvent } from '../../common/types';

export const processSwapEvent = async (bigQuery: BigQuery, event: ExtendedEvent): Promise<void> => {
  const eventInfo = parseSwapEvent(event);

  const swapRow = await pullExistingSwapRow(bigQuery, eventInfo.eventId);

  if (swapRow) {
    // console.log('Swap already processed. Skipped.');
    return;
  }

  // check if a position already exists in the positions table
  const existingPosition = await pullExistingPositionRow(
    bigQuery,
    eventInfo.chainId,
    eventInfo.vammAddress,
    eventInfo.ownerAddress,
    eventInfo.tickLower,
    eventInfo.tickUpper,
  );

  const eventTimestamp = (await event.amm.provider.getBlock(event.blockNumber)).timestamp;

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
