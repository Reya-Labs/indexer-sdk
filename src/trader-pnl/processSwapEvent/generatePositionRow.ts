import { AMM } from '@voltz-protocol/v1-sdk';

import { BigQueryPositionRow } from '../../big-query-support';
import { getCashflowInfo, getTimestampInSeconds } from '../../common';
import { SwapEventInfo } from './parseSwapEvent';

export const generatePositionRow = async (
  amm: AMM,
  eventInfo: SwapEventInfo,
  eventTimestamp: number,
  existingPosition: BigQueryPositionRow | null,
): Promise<BigQueryPositionRow> => {
  const rowLastUpdatedTimestamp = getTimestampInSeconds();

  if (existingPosition) {
    const { scaled: variableFactor } = await amm.variableFactor(
      existingPosition.lastUpdatedTimestamp * 1000,
      eventTimestamp * 1000,
    );

    const { netNotionalLocked, netFixedRateLocked, newCashflow, netTimestamp } = getCashflowInfo(
      {
        notional: existingPosition.netNotionalLocked,
        fixedRate: existingPosition.netFixedRateLocked,
        timestamp: existingPosition.lastUpdatedTimestamp,
      },
      {
        notional: eventInfo.notionalLocked,
        fixedRate: eventInfo.fixedRateLocked,
        timestamp: eventTimestamp,
      },
      Math.floor(amm.termEndTimestampInMS / 1000),
      variableFactor,
    );

    const realizedPnLFromSwaps = existingPosition.realizedPnLFromSwaps + newCashflow;

    const realizedPnLFromFeesPaid =
      eventInfo.feePaidToLps + existingPosition.realizedPnLFromFeesPaid;

    return {
      ...existingPosition,
      realizedPnLFromSwaps,
      realizedPnLFromFeesPaid,
      netNotionalLocked,
      netFixedRateLocked,
      lastUpdatedTimestamp: netTimestamp,
      rowLastUpdatedTimestamp,
    };
  }

  // todo: add empty entries
  return {
    marginEngineAddress: amm.marginEngineAddress.toLowerCase(),
    vammAddress: eventInfo.vammAddress,
    ownerAddress: eventInfo.ownerAddress,
    tickLower: eventInfo.tickLower,
    tickUpper: eventInfo.tickUpper,
    realizedPnLFromSwaps: 0,
    realizedPnLFromFeesPaid: eventInfo.feePaidToLps,
    netNotionalLocked: eventInfo.notionalLocked,
    netFixedRateLocked: eventInfo.fixedRateLocked,
    lastUpdatedTimestamp: eventTimestamp,
    notionalLiquidityProvided: 0,
    realizedPnLFromFeesCollected: 0,
    netMarginDeposited: 0,
    rateOracleIndex: amm.rateOracle.protocolId,
    rowLastUpdatedTimestamp: rowLastUpdatedTimestamp,
    fixedTokenBalance: 0,
    variableTokenBalance: 0,
    positionInitializationTimestamp: eventTimestamp,
    rateOracle: amm.rateOracle.id,
    underlyingToken: amm.underlyingToken.id,
    chainId: eventInfo.chainId,
  };
};
