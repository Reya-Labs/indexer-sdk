export type PortfolioSummary = {
    portfolioValueInUSD: number;
    marginInUSD: number;
    realizedPnLInUSD: number;
    unrealizedPnLInUSD: number;
    notionalInUSD: number;

    numberOfPositions: number;
    healthyPositions: number;
    warningPositions: number;
    dangerPositions: number;
}
