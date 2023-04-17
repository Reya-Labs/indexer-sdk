import { AMM } from '@voltz-protocol/v1-sdk';
import { ethers } from 'ethers';

// eslint-disable-next-line no-use-before-define
export interface ExtendedEvent extends ethers.Event {
  type: 'mint' | 'burn' | 'swap' | 'price_change';
  amm: AMM;
  chainId: number;
  timestamp: number;
}
