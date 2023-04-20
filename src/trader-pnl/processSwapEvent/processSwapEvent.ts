import { pullExistingPositionRow } from '../../big-query-support/pull-data/pullExistingPositionRow';
import { pullExistingSwapRow } from '../../big-query-support/pull-data/pullExistingSwapRow';
import { insertNewSwapAndNewPosition } from '../../big-query-support/push-data/insertNewSwapAndNewPosition';
import { insertNewSwapAndUpdateExistingPosition } from '../../big-query-support/push-data/insertNewSwapAndUpdateExistingPosition';
import { SwapEventInfo } from '../../common/event-parsers/types';

export const processSwapEvent = async (event: SwapEventInfo): Promise<void> => {
  console.log('here?');
  const swapRow = await pullExistingSwapRow(event.eventId);

  console.log('here 2?');
  if (swapRow) {
    // console.log('Swap already processed. Skipped.');
    return;
  }

  // check if a position already exists in the positions table
  const existingPosition = await pullExistingPositionRow(
    event.chainId,
    event.vammAddress,
    event.ownerAddress,
    event.tickLower,
    event.tickUpper,
  );

  const eventTimestamp = (await event.amm.provider.getBlock(event.blockNumber)).timestamp;

  if (existingPosition) {
    // this position has already performed a swap
    await insertNewSwapAndUpdateExistingPosition(
      event.amm,
      event,
      eventTimestamp,
      existingPosition,
    );
  } else {
    // this is the first swap of the position
    await insertNewSwapAndNewPosition(event.amm, event, eventTimestamp);
  }
};
