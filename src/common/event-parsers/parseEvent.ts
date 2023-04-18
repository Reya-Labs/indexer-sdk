import { ExtendedEvent } from '../types';
import { MintOrBurnEventInfo, parseMintOrBurnEvent } from './parseMintOrBurnEvent';
import { parseSwapEvent, SwapEventInfo } from './parseSwapEvent';
import { parseVAMMPriceChangeEvent, VAMMPriceChangeEventInfo } from './parseVAMMPriceChangeEvent';

export const parseEvent = (
  event: ExtendedEvent,
): SwapEventInfo | MintOrBurnEventInfo | VAMMPriceChangeEventInfo => {
  
  switch (event.type) {
    case 'mint' || 'burn': {
      return parseMintOrBurnEvent(event);
    }
    case 'price_change': {
      return parseVAMMPriceChangeEvent(event);
    }
    case 'swap': {
      return parseSwapEvent(event);
    } default: {
      // todo: there's a bug atm where we get to this flow with lp speed sync
      console.log(event.type);
      throw Error('Provide a valid event type');
    }
  }

};
