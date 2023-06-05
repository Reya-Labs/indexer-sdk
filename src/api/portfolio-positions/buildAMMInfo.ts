import { getProtocolName } from './getProtocolName';
import { PortfolioPositionAMM } from './types';

const isBorrowingProtocol = (protocolId: number) => {
  return protocolId === 6 || protocolId === 5 || protocolId === 9;
};

export const buildAMMInfo = (
  chainId: number,
  vammAddress: string,
  protocolId: number,
  tokenName: string,
  startMS: number,
  endMS: number,
): PortfolioPositionAMM => {
  const isBorrowing = isBorrowingProtocol(protocolId);
  const market = getProtocolName(protocolId);

  const amm: PortfolioPositionAMM = {
    id: vammAddress,
    chainId,

    isBorrowing,
    market,

    rateOracle: {
      protocolId,
    },

    underlyingToken: {
      name: tokenName.toLowerCase() as 'eth' | 'usdc' | 'usdt' | 'dai',
    },

    termStartTimestampInMS: startMS,
    termEndTimestampInMS: endMS,
  };

  return amm;
};
