import { AMM } from '@voltz-protocol/v1-sdk';

import { BigQueryPositionRow } from '../../big-query-support';
import {
  getNetFixedRateLocked,
  getRealizedPnLSinceLastSwap,
  getTimestampInSeconds,
} from '../../common';
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

    const realizedPnLSinceLastSwap = getRealizedPnLSinceLastSwap(
      existingPosition.lastUpdatedTimestamp,
      eventTimestamp,
      variableFactor,
      existingPosition.netFixedRateLocked,
      existingPosition.netNotionalLocked,
    );

    const realizedPnLFromSwaps = existingPosition.realizedPnLFromSwaps + realizedPnLSinceLastSwap;

    const realizedPnLFromFeesPaid =
      eventInfo.feePaidToLps + existingPosition.realizedPnLFromFeesPaid;
    const netNotionalLocked = eventInfo.notionalLocked + existingPosition.netNotionalLocked;

    const netFixedRateLocked = getNetFixedRateLocked(
      existingPosition.netFixedRateLocked,
      existingPosition.netNotionalLocked,
      eventInfo.fixedRateLocked,
      eventInfo.notionalLocked,
    );

    return {
      ...existingPosition,
      realizedPnLFromSwaps,
      realizedPnLFromFeesPaid,
      netNotionalLocked,
      netFixedRateLocked,
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
    chainId: eventInfo.chainId.toString(),
  };
};
