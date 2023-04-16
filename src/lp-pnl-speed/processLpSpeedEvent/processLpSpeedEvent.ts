import { BigQuery } from '@google-cloud/bigquery';

import { MintOrBurnEventInfo, parseEvent,SwapEventInfo } from '../../common/event-parsers';
import { ExtendedEvent } from '../../common/types';
import { processMintOrBurnEventLpSpeed } from './processMintOrBurnEventLpSpeed';
import { processSwapEventLpSpeed } from './processSwapEventLpSpeed';

export const processLpSpeedEvent = async (
  bigQuery: BigQuery,
  event: ExtendedEvent,
): Promise<void> => {
  const eventInfo: SwapEventInfo | MintOrBurnEventInfo = parseEvent(event);

  if ('variableTokenDelta' in eventInfo) {
    await processSwapEventLpSpeed(bigQuery, eventInfo);
  } else {
    await processMintOrBurnEventLpSpeed(bigQuery, eventInfo);
  }
};
