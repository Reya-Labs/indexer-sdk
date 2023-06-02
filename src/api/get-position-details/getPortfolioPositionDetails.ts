import { getPositions as getRawPositions } from '@voltz-protocol/subgraph-data';

import { pullAllChainPools } from '../../big-query-support/pools-table/pull-data/pullAllChainPools';
import { SECONDS_IN_YEAR } from '../../common/constants';
import { getPositionInfo } from '../../common/contract-services/getPositionInfo';
import { getVariableFactor } from '../../common/services/getVariableFactor';
import { getTokenPriceInUSD } from '../get-token-price/getTokenPriceInUSD';
import { getPositionPnL } from '../position-pnl/getPositionPnL';
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

const defaultResponse: PortfolioPositionDetails = {
  id: 'invalid_id',
  variant: 'active',
  type: 'LP',
  creationTimestampInMS: 0,
  maturityTimestampInMS: 0,

  tokenPriceUSD: 0,
  notional: 0,
  margin: 0,

  canEdit: false,
  canSettle: false,
  rolloverAmmId: null,

  realizedPNLFees: 0,
  realizedPNLCashflow: 0,
  realizedPNLTotal: 0,

  history: [],
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
    return defaultResponse;
  }

  const position = positions[0];

  const positionType =
    position.positionType === 3 ? 'LP' : position.positionType === 2 ? 'Variable' : 'Fixed';

  const txs = synthetisizeHistory(position);

  // Get fresh information about the position
  const {
    variableTokenBalance,
    fixedTokenBalance,
    notionalTraded,
    notionalProvided,
    margin,
    accumulatedFees,
  } = await getPositionInfo(
    chainId,
    position.amm.marginEngineId,
    position.amm.tokenDecimals,
    ownerAddress,
    tickLower,
    tickUpper,
  );

  const notional = positionType === 'LP' ? notionalProvided : notionalTraded;

  const tokenPriceUSD = await getTokenPriceInUSD(position.amm.tokenName);

  if (position.isSettled) {
    if (position.settlements.length === 0 || position.settlements.length >= 2) {
      return defaultResponse;
    }

    const realizedPNLFees = accumulatedFees;
    const realizedPNLCashflow = position.settlements[0].settlementCashflow;
    const realizedPNLTotal = realizedPNLFees + realizedPNLCashflow;

    return {
      id: positionId,
      variant: 'settled',
      type: positionType,
      creationTimestampInMS: position.creationTimestampInMS,
      maturityTimestampInMS: position.amm.termEndTimestampInMS,

      tokenPriceUSD,
      notional,
      margin,

      canEdit: false,
      canSettle: false,
      rolloverAmmId: null,

      realizedPNLFees,
      realizedPNLCashflow,
      realizedPNLTotal,

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

    // Get settlement cashflow
    let settlementCashflow = 0;
    try {
      const variableFactor = await getVariableFactor(chainId, position.amm.rateOracleId)(
        position.amm.termStartTimestampInMS,
        position.amm.termEndTimestampInMS,
      );
      const fixedFactor =
        (position.amm.termEndTimestampInMS - position.amm.termStartTimestampInMS) /
        SECONDS_IN_YEAR /
        1000;

      settlementCashflow =
        fixedTokenBalance * fixedFactor * 0.01 + variableTokenBalance * variableFactor;
    } catch (_) {
      console.log(`Failed to fetch settlement cashflow.`);
    }

    const realizedPNLCashflow = settlementCashflow;

    const realizedPNLFees = accumulatedFees;
    const realizedPNLTotal = realizedPNLFees + realizedPNLCashflow;

    return {
      id: positionId,
      variant: 'matured',
      type: positionType,
      creationTimestampInMS: position.creationTimestampInMS,
      maturityTimestampInMS: position.amm.termEndTimestampInMS,

      tokenPriceUSD,
      notional,
      margin,

      canEdit: false,
      canSettle: true,
      rolloverAmmId,

      realizedPNLFees,
      realizedPNLCashflow,
      realizedPNLTotal,

      history: txs,
    };
  }

  const { realizedPnLFromSwaps: realizedPNLCashflow } = await getPositionPnL(
    chainId,
    vammAddress,
    ownerAddress,
    tickLower,
    tickUpper,
  );

  const realizedPNLFees = accumulatedFees;
  const realizedPNLTotal = realizedPNLFees + realizedPNLCashflow;

  return {
    id: positionId,
    variant: 'matured',
    type: positionType,
    creationTimestampInMS: position.creationTimestampInMS,
    maturityTimestampInMS: position.amm.termEndTimestampInMS,

    tokenPriceUSD,
    notional,
    margin,

    canEdit: true,
    canSettle: false,
    rolloverAmmId: null,

    realizedPNLFees,
    realizedPNLCashflow,
    realizedPNLTotal,

    history: txs,
  };
};
