import { BigQuery } from '@google-cloud/bigquery';
import { ExtendedEvent } from '../../common/types';
import { MintOrBurnEventInfo, SwapEventInfo, parseEvent } from '../../common/event-parsers';

export const processLpSpeedEvent = async (
  bigQuery: BigQuery,
  event: ExtendedEvent,
): Promise<void> => {

  const eventInfo: SwapEventInfo | MintOrBurnEventInfo = parseEvent(event);

  switch(eventInfo.type) {

    case ('mint' || 'burn'): { 
      await processMintOrBurnEventLpSpeed(event); 
    }

    case 'swap': {
      await processSwapEventLpSpeed(event); 
    }

  }

  
};
