import { ExtendedEvent } from '../types';
import { MintOrBurnEventInfo, parseMintOrBurnEvent } from './parseMintOrBurnEvent';
import { parseSwapEvent, SwapEventInfo } from './parseSwapEvent';
import { parseVAMMPriceChangeEvent, VAMMPriceChangeEventInfo } from './parseVAMMPriceChangeEvent';

export const parseEvent = (event: ExtendedEvent): SwapEventInfo | MintOrBurnEventInfo | VAMMPriceChangeEventInfo => {
  let parsedEvent: SwapEventInfo | MintOrBurnEventInfo | VAMMPriceChangeEventInfo;

  switch (event.type) {
    case 'mint' || 'burn': {
      parsedEvent = parseMintOrBurnEvent(event);
    }
    case 'price_change': {
      parsedEvent = parseVAMMPriceChangeEvent(event);
    }
    default: {
      parsedEvent = parseSwapEvent(event);
    }
  }

  return parsedEvent;
};
