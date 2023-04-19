import { BigQuery } from '@google-cloud/bigquery';

import { parseMintOrBurnEvent, parseVAMMPriceChangeEvent } from '../../common/event-parsers';
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
      console.log('processing mint or burn event');
      
      const eventInfo = parseMintOrBurnEvent(event);

      await processMintOrBurnEventLpSpeed(bigQuery, eventInfo, currentTick);
      return currentTick;
    }
    case 'price_change': {
      console.log('processing vamm price change event');

      const eventInfo = parseVAMMPriceChangeEvent(event);

      await processVAMMPriceChangeEvent(bigQuery, eventInfo);
      return eventInfo.tick;
    }
    default: {
      throw new Error('Swap events are not necessary when processing lp speed events');
    }
  }
};
