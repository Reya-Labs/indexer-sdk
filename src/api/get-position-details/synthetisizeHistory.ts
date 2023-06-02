import { Position } from '@voltz-protocol/subgraph-data';

import { HistoryTransaction } from './types';

export const synthetisizeHistory = (position: Position): HistoryTransaction[] => {
  const txs: HistoryTransaction[] = [];

  position.swaps.forEach((item) => {
    const fixedRate =
      Math.abs(item.variableTokenDelta) > 0
        ? Math.abs(item.unbalancedFixedTokenDelta / item.variableTokenDelta)
        : 0;

    txs.push({
      type: 'swap',
      creationTimestampInMS: item.creationTimestampInMS,
      notional: item.variableTokenDelta,
      paidFees: item.fees,
      fixedRate,
      marginDelta: 0,
    });
  });

  position.mints.forEach((item) => {
    txs.push({
      type: 'mint',
      creationTimestampInMS: item.creationTimestampInMS,
      notional: item.liquidity,
      paidFees: 0,
      fixedRate: 0,
      marginDelta: 0,
    });
  });

  position.burns.forEach((item) => {
    txs.push({
      type: 'burn',
      creationTimestampInMS: item.creationTimestampInMS,
      notional: item.liquidity,
      paidFees: 0,
      fixedRate: 0,
      marginDelta: 0,
    });
  });

  position.marginUpdates.forEach((item) => {
    txs.push({
      type: 'margin-update',
      creationTimestampInMS: item.creationTimestampInMS,
      notional: 0,
      paidFees: 0,
      fixedRate: 0,
      marginDelta: item.marginDelta,
    });
  });

  position.settlements.forEach((item) => {
    txs.push({
      type: 'settlement',
      creationTimestampInMS: item.creationTimestampInMS,
      notional: 0,
      paidFees: 0,
      fixedRate: 0,
      marginDelta: item.settlementCashflow,
    });
  });

  position.liquidations.forEach((item) => {
    txs.push({
      type: 'liquidation',
      creationTimestampInMS: item.creationTimestampInMS,
      notional: item.notionalUnwound,
      paidFees: 0,
      fixedRate: 0,
      marginDelta: item.loss,
    });
  });

  txs.sort((a, b) => a.creationTimestampInMS - b.creationTimestampInMS);

  return txs;
};
