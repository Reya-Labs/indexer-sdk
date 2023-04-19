import { AMM } from "@voltz-protocol/v1-sdk";

import { EventType } from "../types";

type BaseEventInfo = {
    eventId: string;
    type: EventType;
    eventBlockNumber: number;

    chainId: number;
    vammAddress: string;
    amm: AMM;

    rateOracle: string;
    underlyingToken: string;
    marginEngineAddress: string;
}

export type MintOrBurnEventInfo = BaseEventInfo & {
    ownerAddress: string;
    tickLower: number;
    tickUpper: number;

    notionalDelta: number;
    liquidityDelta: number;
};


export type SwapEventInfo = BaseEventInfo & {
    ownerAddress: string;
    tickLower: number;
    tickUpper: number;

    variableTokenDelta: number;
    fixedTokenDeltaUnbalanced: number;
    feePaidToLps: number;
};

export type VAMMPriceChangeEventInfo = BaseEventInfo & {
    tick: number;
};