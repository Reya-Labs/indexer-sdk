import { PortfolioSummary } from "./types";

export const getPortfolioSummary = async (ownerAddress: string): Promise<PortfolioSummary> => {

    const portfolioValue = 0;
    const margin = 0;
    const realisedPnL = 0;
    const unrealisedPnL = 0;
    const notional = 0;
    const numberOfPositions = 0;
    const healthyPositions = 0;
    const warningPositions = 0;
    const dangerPositions = 0;

    const underlyingTokenPriceInUSD = 0;

    return {
        portfolioValueInUnderlyingToken: portfolioValue,
        portfolioValueInUSD: portfolioValue * underlyingTokenPriceInUSD,
    
        marginInUnderlyingToken: margin,
        marginInUSD: margin * underlyingTokenPriceInUSD,
    
        realisedPnLInUnderlyingToken: realisedPnL,
        realisedPnLInUSD: realisedPnL * underlyingTokenPriceInUSD,

        unrealisedPnLInUnderlyingToken: unrealisedPnL,
        unrealisedPnLInUSD: unrealisedPnL * underlyingTokenPriceInUSD,
    
        notionalInUnderlyingToken: notional,
        notionalInUSD: notional * underlyingTokenPriceInUSD,
    
        numberOfPositions,
        healthyPositions,
        warningPositions,
        dangerPositions,
    };
}