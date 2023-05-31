// import { getPortfolioPositions } from "../portfolio-positions/getPortfolioPositions";
// import { HealthFactorStatus } from "../portfolio-positions/old-types";
// import { PortfolioSummary } from "./types";

// export const getPortfolioSummary = async (chainIds: number[], ownerAddress: string): Promise<PortfolioSummary> => {

//     const allPositions = await getPortfolioPositions(chainIds, ownerAddress);

//     const marginInUSD = allPositions.reduce((total, curr) => total + curr.marginInUSD, 0);
//     const realizedPnLInUSD = allPositions.reduce((total, curr) => total + curr.realizedPnLFromSwapsInUSD, 0);
//     const unrealizedPnLInUSD = allPositions.reduce((total, curr) => total + curr.unrealizedPnLFromSwapsInUSD, 0);
//     const notionalInUSD = allPositions.reduce((total, curr) => total + curr.notionalInUSD, 0);
//     const portfolioValueInUSD = marginInUSD + realizedPnLInUSD + unrealizedPnLInUSD;
//     const numberOfPositions = allPositions.length;
//     const healthyPositions = allPositions.filter((p) => p.healthFactor === HealthFactorStatus.HEALTHY).length;
//     const warningPositions = allPositions.filter((p) => p.healthFactor === HealthFactorStatus.WARNING).length;
//     const dangerPositions = allPositions.filter((p) => p.healthFactor === HealthFactorStatus.DANGER).length;

//     return {
//         portfolioValueInUSD,
//         marginInUSD,
//         realizedPnLInUSD,
//         unrealizedPnLInUSD,
//         notionalInUSD,
//         numberOfPositions,
//         healthyPositions,
//         warningPositions,
//         dangerPositions,
//     };
// }