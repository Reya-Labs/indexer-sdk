import { getPositions as getRawPositions } from '@voltz-protocol/subgraph-data';

import { pullAllChainPools } from '../../big-query-support/pools-table/pull-data/pullAllChainPools';
import { getPositionInfo } from '../../common/contract-services/getPositionInfo';
import { getTokenPriceInUSD } from '../get-token-price/getTokenPriceInUSD';
import { getSubgraphURL } from '../subgraph/getSubgraphURL';
import { synthetisizeHistory } from './synthetisizeHistory';
import { PortfolioPositionDetails } from './types';

const decodePositionId = (
  positionId: string,
): {
  chainId: number;
  vammAddress: string;
  ownerAddress: string;
  tickLower: number;
  tickUpper: number;
} => {
  const parts = positionId.split('_');

  return {
    chainId: Number(parts[0]),
    vammAddress: parts[1],
    ownerAddress: parts[2],
    tickLower: Number(parts[3]),
    tickUpper: Number(parts[4]),
  };
};

export const getPortfolioPositionDetails = async (
  positionId: string,
): Promise<PortfolioPositionDetails> => {
  const now = Date.now().valueOf();

  const { chainId, vammAddress, ownerAddress, tickLower, tickUpper } = decodePositionId(positionId);

  // Get transaction history
  const positions = (
    await getRawPositions(
      getSubgraphURL(chainId),
      now,
      {
        owners: [ownerAddress],
        ammIDs: [vammAddress],
      },
      true,
    )
  ).filter((p) => p.tickLower === tickLower && p.tickUpper === tickUpper);

  if (positions.length === 0 || positions.length >= 2) {
    return {
      id: positionId,

      tokenPriceUSD: 0,
      notional: 0,
      margin: 0,
      fees: 0,

      canEdit: false,
      canSettle: false,
      rolloverAmmId: null,

      history: [],
    };
  }

  const position = positions[0];
  const txs = synthetisizeHistory(position);

  // Get fresh information about the position
  const { notionalTraded, notionalProvided, margin, accumulatedFees } = await getPositionInfo(
    chainId,
    position.amm.marginEngineId,
    position.amm.tokenDecimals,
    ownerAddress,
    tickLower,
    tickUpper,
  );

  const notional = position.positionType === 3 ? notionalProvided : notionalTraded;

  const tokenPriceUSD = await getTokenPriceInUSD(position.amm.tokenName);

  if (position.isSettled) {
    return {
      id: positionId,

      tokenPriceUSD,
      notional,
      margin,
      fees: accumulatedFees,

      canEdit: false,
      canSettle: false,
      rolloverAmmId: null,

      history: txs,
    };
  }

  const isMatured = position.amm.termEndTimestampInMS <= now;

  if (isMatured) {
    // Check for available rollovers
    const pools = (await pullAllChainPools([chainId]))
      .filter(
        (pool) =>
          pool.protocolId === position.amm.protocolId &&
          pool.tokenId.toLowerCase() === position.amm.tokenId.toLowerCase() &&
          pool.termEndTimestampInMS >= now,
      )
      .sort((a, b) => b.termEndTimestampInMS - a.termEndTimestampInMS);

    const rolloverAmmId = pools.length === 0 ? null : pools[0].vamm;

    return {
      id: positionId,

      tokenPriceUSD,
      notional,
      margin,
      fees: accumulatedFees,

      canEdit: false,
      canSettle: true,
      rolloverAmmId,

      history: txs,
    };
  }

  return {
    id: positionId,

    tokenPriceUSD,
    notional,
    margin,
    fees: accumulatedFees,

    canEdit: true,
    canSettle: false,
    rolloverAmmId: null,

    history: txs,
  };
};
