import { pullExistingSwapRow } from '../../big-query-support/pull-data/pullExistingSwapRow';
import { insertNewSwap } from '../../big-query-support/push-data/insertNewSwap';
import { SwapEventInfo } from '../../common/event-parsers/types';

export const processSwapEvent = async (event: SwapEventInfo): Promise<void> => {
  const swapRow = await pullExistingSwapRow(event.eventId);

  if (swapRow) {
    // console.log('Swap already processed. Skipped.');
    return;
  }

  await insertNewSwap(event);
};
