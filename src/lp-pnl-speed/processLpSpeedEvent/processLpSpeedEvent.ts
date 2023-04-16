import { BigQuery } from '@google-cloud/bigquery';

import { MintOrBurnEventInfo, parseEvent, SwapEventInfo, VAMMPriceChangeEventInfo } from '../../common/event-parsers';
import { ExtendedEvent } from '../../common/types';
import { processMintOrBurnEventLpSpeed } from './processMintOrBurnEventLpSpeed';

export const processLpSpeedEvent = async (
  bigQuery: BigQuery,
  event: ExtendedEvent,
): Promise<void> => {
  const eventInfo: VAMMPriceChangeEventInfo | MintOrBurnEventInfo | SwapEventInfo = parseEvent(event);

  if ('tick' in eventInfo) {
    await processVAMMPriceChangeEvent(bigQuery, eventInfo);
  } else if ('notionalDelta' in eventInfo) {
    await processMintOrBurnEventLpSpeed(bigQuery, eventInfo);
  } else {
    throw Error("Swap events are not necessary when processing lp speed events");
  }
};
