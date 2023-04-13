import { AMM } from '@voltz-protocol/v1-sdk';

import { BigQueryPositionRow } from '../../big-query-support';
import {
  getCashflowInfo,
  getFixedRateLocked,
  getLiquidityIndex,
  getTimestampInSeconds,
  SECONDS_IN_YEAR,
} from '..';
import { SwapEventInfo } from './parseSwapEvent';

export const generatePositionRow = async (
  amm: AMM,
  eventInfo: SwapEventInfo,
  eventTimestamp: number,
  existingPosition: BigQueryPositionRow | null,
): Promise<BigQueryPositionRow> => {
  const rowLastUpdatedTimestamp = getTimestampInSeconds();

  const liquidityIndexAtEvent = await getLiquidityIndex(
    eventInfo.chainId,
    amm.provider,
    amm.marginEngineAddress,
    eventInfo.eventBlockNumber,
  );
  const unbalancedFixedTokenDelta = eventInfo.fixedTokenDeltaUnbalanced;

  const fixedRateLocked = getFixedRateLocked(
    eventInfo.variableTokenDelta,
    eventInfo.fixedTokenDeltaUnbalanced,
  );

  const incomingCashflowLiFactor = eventInfo.variableTokenDelta / liquidityIndexAtEvent;
  const incomingCashflowTimeFactor = unbalancedFixedTokenDelta * 0.01;
  const incomingCashflowFreeTerm =
    -eventInfo.variableTokenDelta -
    (unbalancedFixedTokenDelta * 0.01 * eventTimestamp) / SECONDS_IN_YEAR;

  const { netNotionalLocked, netFixedRateLocked } = getCashflowInfo(
    {
      notional: existingPosition?.netNotionalLocked || 0,
      fixedRate: existingPosition?.netFixedRateLocked || 0,
    },
    {
      notional: eventInfo.variableTokenDelta,
      fixedRate: fixedRateLocked,
    },
  );

  // todo: add empty entries
  return {
    chainId: eventInfo.chainId,
    marginEngineAddress:
      existingPosition?.marginEngineAddress || amm.marginEngineAddress.toLowerCase(),
    vammAddress: existingPosition?.vammAddress || eventInfo.vammAddress,
    ownerAddress: existingPosition?.ownerAddress || eventInfo.ownerAddress,
    tickLower: existingPosition?.tickLower || eventInfo.tickLower,
    tickUpper: existingPosition?.tickUpper || eventInfo.tickUpper,
    realizedPnLFromSwaps: 0, // todo: deprecate
    realizedPnLFromFeesPaid:
      (existingPosition?.realizedPnLFromFeesPaid || 0) - eventInfo.feePaidToLps,
    netNotionalLocked,
    netFixedRateLocked,
    lastUpdatedTimestamp: eventTimestamp,
    notionalLiquidityProvided: existingPosition?.notionalLiquidityProvided || 0, // todo: track
    realizedPnLFromFeesCollected: existingPosition?.realizedPnLFromFeesCollected || 0, // todo: track
    netMarginDeposited: existingPosition?.netMarginDeposited || 0, // todo: track
    rateOracleIndex: existingPosition?.rateOracleIndex || amm.rateOracle.protocolId,
    rowLastUpdatedTimestamp: rowLastUpdatedTimestamp,
    fixedTokenBalance: existingPosition?.fixedTokenBalance || 0, // todo: track
    variableTokenBalance: existingPosition?.variableTokenBalance || 0, // todo: track
    positionInitializationTimestamp:
      existingPosition?.positionInitializationTimestamp || eventTimestamp,
    rateOracle: existingPosition?.rateOracle || amm.rateOracle.id,
    underlyingToken: existingPosition?.underlyingToken || amm.underlyingToken.name,
    cashflowLiFactor: (existingPosition?.cashflowLiFactor || 0) + incomingCashflowLiFactor,
    cashflowTimeFactor: (existingPosition?.cashflowTimeFactor || 0) + incomingCashflowTimeFactor,
    cashflowFreeTerm: (existingPosition?.cashflowFreeTerm || 0) + incomingCashflowFreeTerm,
  };
};
