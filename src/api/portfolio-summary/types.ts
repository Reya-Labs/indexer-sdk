export type PortfolioSummary = {
    portfolioValueInUnderlyingToken: number;
    portfolioValueInUSD: number;

    marginInUnderlyingToken: number;
    marginInUSD: number;

    realisedPnLInUnderlyingToken: number;
    realisedPnLInUSD: number;

    unrealisedPnLInUnderlyingToken: number;
    unrealisedPnLInUSD: number;

    notionalInUnderlyingToken: number;
    notionalInUSD: number;

    numberOfPositions: number;
    healthyPositions: number;
    warningPositions: number;
    dangerPositions: number;
}
