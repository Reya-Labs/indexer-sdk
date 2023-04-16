import { BigQuery } from '@google-cloud/bigquery';

import { MintOrBurnEventInfo, parseEvent,SwapEventInfo } from '../../common/event-parsers';
import { ExtendedEvent } from '../../common/types';
import { processMintOrBurnEventLpSpeed } from './processMintOrBurnEventLpSpeed';
import { processVAMMPriceChangeEvent } from './processVAMMPriceChangeEvent';

export const processLpSpeedEvent = async (
  bigQuery: BigQuery,
  event: ExtendedEvent,
): Promise<void> => {
  const eventInfo: VAMMPriceChangeEvent | MintOrBurnEventInfo = parseEvent(event);

  if ('variableTokenDelta' in eventInfo) {
    await processVAMMPriceChangeEvent(bigQuery, eventInfo);
  } else {
    await processMintOrBurnEventLpSpeed(bigQuery, eventInfo);
  }
};
