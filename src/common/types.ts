import { AMM } from '@voltz-protocol/v1-sdk';
import { Event } from 'ethers';

export interface ExtendedEvent extends Event {
  type: 'mint' | 'burn' | 'swap' | 'price_change' | 'vamm_initialization';
  amm: AMM;
  chainId: number;
}
