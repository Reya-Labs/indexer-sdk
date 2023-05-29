export type PortfolioPosition = {
    chainId: number;
    vammAddress: string;
    ownerAddress: string;
    tickLower: number;
    tickUpper: number;

    status: 'active' | 'matured' | 'settled';

    notionalProvided: number;
    notional: number;
    margin: number;
    accumulatedFees: number;

    realizedPnLFromSwaps: number,
    realizedPnLFromFeesPaid: number,
    realizedPnLFromFeesCollected: number,
    unrealizedPnLFromSwaps: number,

    healthFactor: HealthFactorStatus,
    inRangeHealthFactor: HealthFactorStatus,
};

export enum HealthFactorStatus {
    NOT_FOUND = 0,
    DANGER = 1,
    WARNING = 2,
    HEALTHY = 3,
};
