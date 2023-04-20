// Swap rows do NOT change in time
export type BigQuerySwapRow = {
  eventId: string;
  vammAddress: string;
  ownerAddress: string;
  tickLower: number;
  tickUpper: number;

  variableTokenDelta: number;
  fixedTokenDeltaUnbalanced: number;
  feePaidToLps: number;

  eventBlockNumber: number;
  eventTimestamp: number;
  rowLastUpdatedTimestamp: number;
  
  rateOracle: string;
  underlyingToken: string;
  marginEngineAddress: string;
  chainId: number;
};

// Mint or Burn rows do NOT change in time
export type BigQueryMintOrBurnRow = {
  eventId: string;
  vammAddress: string;
  ownerAddress: string;
  tickLower: number;
  tickUpper: number;

  notionalDelta: number;

  eventBlockNumber: number;
  eventTimestamp: number;
  rowLastUpdatedTimestamp: number;

  rateOracle: string;
  underlyingToken: string;
  marginEngineAddress: string;
  chainId: number;
};

// Position rows change in time
export type BigQueryPositionRow = {
  marginEngineAddress: string; // immutable
  vammAddress: string; // immutable
  ownerAddress: string; // immutable
  tickLower: number; // immutable
  tickUpper: number; // immutable
  realizedPnLFromSwaps: number;
  realizedPnLFromFeesPaid: number;
  netNotionalLocked: number;
  netFixedRateLocked: number;
  lastUpdatedBlockNumber: number;
  notionalLiquidityProvided: number;
  realizedPnLFromFeesCollected: number;
  netMarginDeposited: number;
  rateOracleIndex: number; // immutable
  rowLastUpdatedTimestamp: number;
  fixedTokenBalance: number;
  variableTokenBalance: number;
  positionInitializationBlockNumber: number; // immutable
  rateOracle: string; // immutable
  underlyingToken: string; // immutable
  chainId: number; // immutable
  cashflowLiFactor: number;
  cashflowTimeFactor: number;
  cashflowFreeTerm: number;
  liquidity: number;
};
