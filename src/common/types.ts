import { AMM } from '@voltz-protocol/v1-sdk';
import { ethers } from 'ethers';

export interface ExtendedEvent extends ethers.Event {
  type: 'mint' | 'burn' | 'swap';
  amm: AMM;
  chainId: number;
}
