import { ExtendedEvent } from '../types';
import { MintOrBurnEventInfo, parseMintOrBurnEvent } from './parseMintOrBurnEvent';
import { parseSwapEvent, SwapEventInfo } from './parseSwapEvent';
import { parseVAMMPriceChangeEvent, VAMMPriceChangeEventInfo } from './parseVAMMPriceChangeEvent';

export const parseEvent = (
  event: ExtendedEvent,
): SwapEventInfo | MintOrBurnEventInfo | VAMMPriceChangeEventInfo => {
  
  switch (event.type) {
    case 'mint': {
      return parseMintOrBurnEvent(event);
    }
    case 'burn':  {
      // same as mint
      return parseMintOrBurnEvent(event);
    }
    case 'price_change': {
      return parseVAMMPriceChangeEvent(event);
    }
    case 'swap': {
      return parseSwapEvent(event);
    } default: {
      throw Error('Provide a valid event type');
    }
  }

};
