import { BigQuery } from '@google-cloud/bigquery';

import {
  MintOrBurnEventInfo,
  parseEvent,
  SwapEventInfo,
  VAMMPriceChangeEventInfo,
} from '../../common/event-parsers';
import { ExtendedEvent } from '../../common/types';
import { processMintOrBurnEventLpSpeed } from './processMintOrBurnEventLpSpeed';
import { processVAMMPriceChangeEvent } from './processVAMMPriceChangeEvent';

export const processLpSpeedEvent = async (
  bigQuery: BigQuery,
  event: ExtendedEvent,
  currentTick: number
): Promise<number> => {
  const eventInfo: VAMMPriceChangeEventInfo | MintOrBurnEventInfo | SwapEventInfo =
    parseEvent(event);

  if ('tick' in eventInfo) {
    await processVAMMPriceChangeEvent(bigQuery, eventInfo);
    return eventInfo.tick;
  } else if ('notionalDelta' in eventInfo) {
    await processMintOrBurnEventLpSpeed(bigQuery, eventInfo, currentTick);
    return currentTick;
  } else {
    throw Error('Swap events are not necessary when processing lp speed events');
  }
};
