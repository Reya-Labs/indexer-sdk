import { BigQuery } from '@google-cloud/bigquery';

import { parseMintOrBurnEvent } from '../../common/event-parsers/parseMintOrBurnEvent';
import { parseVAMMPriceChangeEvent } from '../../common/event-parsers/parseVAMMPriceChangeEvent';
import { ExtendedEvent } from '../../common/types';
import { processMintOrBurnEventLpSpeed } from './processMintOrBurnEventLpSpeed';
import { processVAMMPriceChangeEvent } from './processVAMMPriceChangeEvent';

export const processLpSpeedEvent = async (
  bigQuery: BigQuery,
  event: ExtendedEvent,
  currentTick: number,
): Promise<number> => {
  switch (event.type) {
    case 'mint':
    case 'burn': {
      const eventInfo = parseMintOrBurnEvent(event);

      await processMintOrBurnEventLpSpeed(bigQuery, eventInfo, currentTick);

      return currentTick;
    }
    case 'price_change': {
      const eventInfo = parseVAMMPriceChangeEvent(event);

      await processVAMMPriceChangeEvent(bigQuery, eventInfo);
      return eventInfo.tick;
    }
    default: {
      throw new Error('Swap events are not necessary when processing lp speed events');
    }
  }
};
