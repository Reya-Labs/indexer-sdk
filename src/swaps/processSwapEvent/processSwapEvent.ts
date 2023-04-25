import { pullExistingSwapRow } from '../../big-query-support/active-swaps-table/pull-data/pullExistingSwapRow';
import { insertNewSwap } from '../../big-query-support/active-swaps-table/push-data/insertNewSwap';
import { SwapEventInfo } from '../../common/event-parsers/types';

export const processSwapEvent = async (event: SwapEventInfo): Promise<void> => {
  const swapRow = await pullExistingSwapRow(event.eventId);

  if (swapRow) {
    return;
  }

  await insertNewSwap(event);
};
