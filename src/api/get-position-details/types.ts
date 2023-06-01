export type PortfolioPositionDetails = {
  id: string;

  tokenPriceUSD: number;
  notional: number;
  margin: number;
  fees: number;

  canEdit: boolean;
  canSettle: boolean;
  rolloverAmmId: null | string;

  history: HistoryTransaction[];
};

export type HistoryTransaction = {
  type: 'swap' | 'mint' | 'burn' | 'margin-update' | 'liquidation' | 'settlement';
  creationTimestampInMS: number;
  notional: number;
  paidFees: number;
  fixedRate: number;
  marginDelta: number;
};
