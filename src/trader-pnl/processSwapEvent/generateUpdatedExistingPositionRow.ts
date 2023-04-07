import { BigQuery } from '@google-cloud/bigquery';
import { AMM } from '@voltz-protocol/v1-sdk';

import { PositionRow } from '../../big-query-support';
import {
  getNetFixedRateLocked,
  getRealizedPnLSinceLastSwap,
  getTimestampInSeconds,
} from '../../common';
import { SwapEventInfo } from './parseSwapEvent';

export const generateUpdatedExistingPositionRow = async (
  bigQuery: BigQuery,
  amm: AMM,
  eventInfo: SwapEventInfo,
  eventTimestamp: number,
  existingPosition: PositionRow,
) => {
  const rowLastUpdatedTimestamp = getTimestampInSeconds();

  const netNotionalLocked = existingPosition.netNotionalLocked + eventInfo.notionalLocked;

  const netFixedRateLocked = getNetFixedRateLocked(
    existingPosition.netFixedRateLocked,
    existingPosition.netNotionalLocked,
    eventInfo.fixedRateLocked,
    eventInfo.notionalLocked,
  );

  const realizedPnLSinceLastSwap = await getRealizedPnLSinceLastSwap(
    amm,
    eventTimestamp,
    existingPosition.lastUpdatedTimestamp,
    existingPosition.netFixedRateLocked,
    existingPosition.netNotionalLocked,
  );

  return {
    marginEngineAddress: amm.marginEngineAddress,
    vammAddress: eventInfo.vammAddress,
    ownerAddress: eventInfo.ownerAddress,
    tickLower: eventInfo.tickLower,
    tickUpper: eventInfo.tickUpper,
    realizedPnLFromSwaps: existingPosition.realizedPnLFromSwaps + realizedPnLSinceLastSwap,
    realizedPnLFromFeesPaid: existingPosition.realizedPnLFromFeesPaid + eventInfo.feePaidToLps,
    netNotionalLocked: netNotionalLocked,
    netFixedRateLocked: netFixedRateLocked,
    lastUpdatedTimestamp: bigQuery.timestamp(eventTimestamp).value,
    rowLastUpdatedTimestamp: bigQuery.timestamp(rowLastUpdatedTimestamp).value,
    notionalLiquidityProvided: 0,
    realizedPnLFromFeesCollected: 0,
    netMarginDeposited: 0,
  };
};
