import { PortfolioPosition, PortfolioSummary } from './types';

export const getPortfolioSummary = (positions: PortfolioPosition[]): PortfolioSummary => {
  const marginUSD = positions.reduce((total, curr) => total + curr.marginUSD, 0);
  const realizedPNLUSD = positions.reduce((total, curr) => total + curr.realizedPNLTotalUSD, 0);
  const unrealizedPNLUSD = positions.reduce((total, curr) => total + curr.unrealizedPNLUSD, 0);
  const notionalUSD = positions.reduce((total, curr) => total + curr.notionalUSD, 0);
  const portfolioValueUSD = marginUSD + realizedPNLUSD + unrealizedPNLUSD;
  const numberOfPositions = positions.length;

  const activePositions = positions.filter((p) => p.status.variant === 'active');
  const healthyPositions = activePositions.filter((p) => p.status.health === 'healthy').length;
  const warningPositions = activePositions.filter((p) => p.status.health === 'warning').length;
  const dangerPositions = activePositions.filter((p) => p.status.health === 'danger').length;

  return {
    portfolioValueUSD,
    marginUSD,
    realizedPNLUSD,
    unrealizedPNLUSD,
    notionalUSD,
    numberOfPositions,
    healthyPositions,
    warningPositions,
    dangerPositions,
  };
};
