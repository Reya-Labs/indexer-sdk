export type PortfolioPosition = {
    chainId: number;
    vammAddress: string;
    ownerAddress: string;
    tickLower: number;
    tickUpper: number;

    status: 'active' | 'matured' | 'settled';

    notionalProvided: number;
    notionalProvidedInUSD: number;

    notional: number;
    notionalInUSD: number;

    margin: number;
    marginInUSD: number;

    accumulatedFees: number;
    accumulatedFeesInUSD: number;

    realizedPnLFromSwaps: number,
    realizedPnLFromSwapsInUSD: number,

    realizedPnLFromFeesPaid: number,
    realizedPnLFromFeesPaidInUSD: number,

    unrealizedPnLFromSwaps: number,
    unrealizedPnLFromSwapsInUSD: number,

    healthFactor: HealthFactorStatus,
    inRangeHealthFactor: HealthFactorStatus,
};

export enum HealthFactorStatus {
    NOT_FOUND = 0,
    DANGER = 1,
    WARNING = 2,
    HEALTHY = 3,
};
