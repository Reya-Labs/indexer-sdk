import { AMM } from '@voltz-protocol/v1-sdk';
import { Event } from 'ethers';

import { EventType } from '../types';

interface BaseEventInfo extends Event {
  eventId: string;
  type: EventType;

  chainId: number;
  vammAddress: string; // todo: deprecate because we have amm
  amm: AMM;

  rateOracle: string; // todo: deprecate because we have amm
  underlyingToken: string; // todo: deprecate because we have amm
  marginEngineAddress: string; // todo: deprecate because we have amm
}

export interface MintOrBurnEventInfo extends BaseEventInfo {
  ownerAddress: string;
  tickLower: number;
  tickUpper: number;

  notionalDelta: number;
  liquidityDelta: number;
};

export interface SwapEventInfo extends BaseEventInfo {
  ownerAddress: string;
  tickLower: number;
  tickUpper: number;

  variableTokenDelta: number;
  fixedTokenDeltaUnbalanced: number;
  feePaidToLps: number;
};

export interface VAMMPriceChangeEventInfo extends BaseEventInfo {
  isInitial: boolean;
  tick: number;
};
