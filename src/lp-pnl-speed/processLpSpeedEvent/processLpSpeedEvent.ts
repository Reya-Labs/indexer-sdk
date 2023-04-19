import { BigQuery } from '@google-cloud/bigquery';

import {
  parseEvent,
} from '../../common/event-parsers';
import { ExtendedEvent } from '../../common/types';
import { processMintOrBurnEventLpSpeed } from './processMintOrBurnEventLpSpeed';
import { processVAMMPriceChangeEvent } from './processVAMMPriceChangeEvent';

export const processLpSpeedEvent = async (
  bigQuery: BigQuery,
  event: ExtendedEvent,
  currentTick: number,
): Promise<number> => {
  const eventInfo = parseEvent(event);

  if ('tick' in eventInfo) {
    console.log('processing vamm price change event');
    await processVAMMPriceChangeEvent(bigQuery, eventInfo);
    return eventInfo.tick;
  } else if ('liquidityDelta' in eventInfo) {
    console.log('processing mint or burn event');
    await processMintOrBurnEventLpSpeed(bigQuery, eventInfo, currentTick);
    return currentTick;
  } else {
    throw Error('Swap events are not necessary when processing lp speed events');
  }
};
