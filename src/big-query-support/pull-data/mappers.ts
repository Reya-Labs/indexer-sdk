/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import { bqNumericToNumber, bqTimestampToUnixSeconds } from '../utils';
import { BigQueryMintOrBurnRow, BigQueryPositionRow, BigQuerySwapRow } from './types';

export const mapToBigQueryPositionRow = (row: any): BigQueryPositionRow => ({
  marginEngineAddress: row.marginEngineAddress,
  vammAddress: row.vammAddress,
  ownerAddress: row.ownerAddress,
  tickLower: row.tickLower,
  tickUpper: row.tickUpper,
  realizedPnLFromSwaps: bqNumericToNumber(row.realizedPnLFromSwaps),
  realizedPnLFromFeesPaid: bqNumericToNumber(row.realizedPnLFromFeesPaid),
  netNotionalLocked: bqNumericToNumber(row.netNotionalLocked),
  netFixedRateLocked: bqNumericToNumber(row.netFixedRateLocked),
  lastUpdatedBlockNumber: row.lastUpdatedBlockNumber,
  notionalLiquidityProvided: bqNumericToNumber(row.notionalLiquidityProvided),
  realizedPnLFromFeesCollected: bqNumericToNumber(row.realizedPnLFromFeesCollected),
  netMarginDeposited: bqNumericToNumber(row.netMarginDeposited),
  rateOracleIndex: bqNumericToNumber(row.rateOracleIndex),
  rowLastUpdatedTimestamp: bqTimestampToUnixSeconds(row.rowLastUpdatedTimestamp),
  fixedTokenBalance: bqNumericToNumber(row.fixedTokenBalance),
  variableTokenBalance: bqNumericToNumber(row.variableTokenBalance),
  positionInitializationBlockNumber: row.positionInitializationBlockNumber,
  rateOracle: row.rateOracle,
  underlyingToken: row.underlyingToken,
  chainId: row.chainId,
  cashflowLiFactor: bqNumericToNumber(row.cashflowLiFactor),
  cashflowTimeFactor: bqNumericToNumber(row.cashflowTimeFactor),
  cashflowFreeTerm: bqNumericToNumber(row.cashflowFreeTerm),
  liquidity: bqNumericToNumber(row.liquidity),
});

export const mapToBigQueryMintOrBurnRow = (row: any): BigQueryMintOrBurnRow => ({
  eventId: row.eventId,
  vammAddress: row.vammAddress,
  ownerAddress: row.ownerAddress,
  tickLower: row.tickLower,
  tickUpper: row.tickUpper,
  notionalDelta: bqNumericToNumber(row.notionalDelta),
  eventBlockNumber: bqNumericToNumber(row.eventBlockNumber),
  eventTimestamp: bqTimestampToUnixSeconds(row.eventTimestamp),
  rowLastUpdatedTimestamp: bqTimestampToUnixSeconds(row.rowLastUpdatedTimestamp),
  rateOracle: row.rateOracle,
  underlyingToken: row.underlyingToken,
  marginEngineAddress: row.marginEngineAddress,
  chainId: bqNumericToNumber(row.chainId),
});

export const mapToBigQuerySwapRow = (row: any): BigQuerySwapRow => ({
  eventId: row.eventId,
  vammAddress: row.vammAddress,
  ownerAddress: row.ownerAddress,
  tickLower: row.tickLower,
  tickUpper: row.tickUpper,

  variableTokenDelta: bqNumericToNumber(row.variableTokenDelta),
  fixedTokenDeltaUnbalanced: bqNumericToNumber(row.fixedTokenDeltaUnbalanced),
  feePaidToLps: bqNumericToNumber(row.feePaidToLps),

  eventBlockNumber: row.eventBlockNumber,
  eventTimestamp: bqTimestampToUnixSeconds(row.eventTimestamp),
  rowLastUpdatedTimestamp: bqTimestampToUnixSeconds(row.rowLastUpdatedTimestamp),

  rateOracle: row.rateOracle,
  underlyingToken: row.underlyingToken,
  marginEngineAddress: row.marginEngineAddress,
  chainId: row.chainId,
});
