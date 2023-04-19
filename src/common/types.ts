import { AMM } from '@voltz-protocol/v1-sdk';
import { Event } from 'ethers';

export type EventType = 'mint' | 'burn' | 'swap' | 'price_change';

export interface ExtendedEvent extends Event {
  amm: AMM;
  chainId: number;
  type: EventType;
};
