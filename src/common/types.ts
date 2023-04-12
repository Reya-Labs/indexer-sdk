import { ethers } from 'ethers';
import { AMM } from '@voltz-protocol/v1-sdk';


export interface ExtendedEvent extends ethers.Event {
    type: 'mint' | 'burn' | 'swap',
    amm: AMM
}