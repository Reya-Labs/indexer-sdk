import { ExtendedEvent } from '../types';
import { MintOrBurnEventInfo, parseMintOrBurnEvent } from './parseMintOrBurnEvent';
import { parseSwapEvent,SwapEventInfo } from './parseSwapEvent';

export const parseEvent = (event: ExtendedEvent): SwapEventInfo | MintOrBurnEventInfo => {
  let parsedEvent: SwapEventInfo | MintOrBurnEventInfo;

  switch (event.type) {
    case 'mint' || 'burn': {
      parsedEvent = parseMintOrBurnEvent(event);
    }

    default: {
      parsedEvent = parseSwapEvent(event);
    }
  }

  return parsedEvent;
};
