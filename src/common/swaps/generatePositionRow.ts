import { AMM } from '@voltz-protocol/v1-sdk';

import { BigQueryPositionRow } from '../../big-query-support';
import { getCashflowInfo, getTimestampInSeconds, SECONDS_IN_YEAR } from '..';
import { SwapEventInfo } from '../event-parsers/parseSwapEvent';

export const generatePositionRow = (
  amm: AMM,
  eventInfo: SwapEventInfo,
  eventTimestamp: number,
  existingPosition: BigQueryPositionRow | null,
  liquidityIndexAtRootEvent: number,
): BigQueryPositionRow => {
  const rowLastUpdatedTimestamp = getTimestampInSeconds();

  const unbalancedFixedTokenDelta = eventInfo.fixedTokenDeltaUnbalanced;

  const incomingCashflowLiFactor = eventInfo.variableTokenDelta / liquidityIndexAtRootEvent;
  const incomingCashflowTimeFactor = unbalancedFixedTokenDelta * 0.01;
  const incomingCashflowFreeTerm =
    -eventInfo.variableTokenDelta -
    (unbalancedFixedTokenDelta * 0.01 * eventTimestamp) / SECONDS_IN_YEAR;

  const {
    notional: netNotionalLocked,
    cashflowLiFactor,
    cashflowTimeFactor,
    cashflowFreeTerm,
  } = getCashflowInfo(
    {
      notional: existingPosition?.netNotionalLocked || 0,
      cashflowLiFactor: existingPosition?.cashflowLiFactor || 0,
      cashflowTimeFactor: existingPosition?.cashflowTimeFactor || 0,
      cashflowFreeTerm: existingPosition?.cashflowFreeTerm || 0,
    },
    {
      notional: eventInfo.variableTokenDelta,
      cashflowLiFactor: incomingCashflowLiFactor,
      cashflowTimeFactor: incomingCashflowTimeFactor,
      cashflowFreeTerm: incomingCashflowFreeTerm,
    },
    Math.floor(amm.termEndTimestampInMS / 1000),
  );

  const netFixedRateLocked =
    netNotionalLocked === 0 ? 0 : Math.abs(cashflowTimeFactor / netNotionalLocked);

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
    rateOracle: existingPosition?.rateOracle || amm.rateOracle.protocol,
    underlyingToken: existingPosition?.underlyingToken || amm.underlyingToken.name,
    cashflowLiFactor,
    cashflowTimeFactor,
    cashflowFreeTerm,
  };
};
