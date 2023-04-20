import {
  MintOrBurnEventInfo,
  SwapEventInfo,
  VAMMPriceChangeEventInfo,
} from './event-parsers/types';

export type EventType = 'mint' | 'burn' | 'swap' | 'price_change' | 'vamm_initialization';

export type EventInfo = MintOrBurnEventInfo | SwapEventInfo | VAMMPriceChangeEventInfo;
