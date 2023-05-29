import {
    getPositions as getRawPositions,
    Position as RawPosition
} from '@voltz-protocol/subgraph-data';

import { getSubgraphURL } from "../subgraph/getSubgraphURL";
import { PortfolioSummary } from "./types";

export const getPortfolioSummary = async (chainIds: number[], ownerAddress: string): Promise<PortfolioSummary> => {

    const now = Date.now().valueOf();
    const allPositions: RawPosition[] = [];

    for (const chainId of chainIds) {
        const positions = await getRawPositions(
            getSubgraphURL(chainId),
            now,
            {
                owners: [ownerAddress],
            },
        );

        allPositions.push(...positions);
    }


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