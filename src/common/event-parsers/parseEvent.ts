import { ExtendedEvent } from '../types';
import { SwapEventInfo, parseSwapEvent } from './parseSwapEvent';
import { MintOrBurnEventInfo, parseMintOrBurnEvent } from './parseMintOrBurnEvent';



export const parseEvent = (event: ExtendedEvent): SwapEventInfo | MintOrBurnEventInfo => {

    let parsedEvent: SwapEventInfo | MintOrBurnEventInfo;

    switch(event.type) { 

        case ('mint' || 'burn'): { 
            parsedEvent = parseMintOrBurnEvent(event); 
        }

        default: {
            parsedEvent = parseSwapEvent(event);
        }

    }

    return parsedEvent;


};
