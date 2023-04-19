import { ExtendedEvent } from '../types';
import { parseMintOrBurnEvent } from './parseMintOrBurnEvent';
import { parseSwapEvent } from './parseSwapEvent';
import { parseVAMMPriceChangeEvent } from './parseVAMMPriceChangeEvent';
import { MintOrBurnEventInfo, SwapEventInfo, VAMMPriceChangeEventInfo } from './types';

export const parseEvent = (
  event: ExtendedEvent,
): SwapEventInfo | MintOrBurnEventInfo | VAMMPriceChangeEventInfo => {
  switch (event.type) {
    case 'mint': {
      return parseMintOrBurnEvent(event);
    }
    case 'burn': {
      // same as mint
      return parseMintOrBurnEvent(event);
    }
    case 'price_change': {
      return parseVAMMPriceChangeEvent(event);
    }
    case 'swap': {
      return parseSwapEvent(event);
    }
  }
};
