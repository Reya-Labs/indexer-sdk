import { BigQuery } from '@google-cloud/bigquery';
import { AMM } from '@voltz-protocol/v1-sdk';
import { ethers } from 'ethers';

import { PositionRow } from '../../big-query-support';
import { getNetFixedRateLocked, getRealizedPnLSinceLastSwap, getTimestampInSeconds } from '../../common';
import { parseSwapEvent } from './parseSwapEvent';

export const generateUpdatedExistingPositionRow = async (
  bigQuery: BigQuery,
  amm: AMM,
  event: ethers.Event,
  existingPosition: PositionRow,
) => {
  const {
    vammAddress,
    fixedRateLocked,
    notionalLocked,
    feePaidToLps,
    eventTimestamp,
    ownerAddress,
    tickLower,
    tickUpper,
  } = await parseSwapEvent(amm, event);

  const rowLastUpdatedTimestamp = getTimestampInSeconds();
  
  const netNotionalLocked = existingPosition.netNotionalLocked + notionalLocked;

  const netFixedRateLocked = getNetFixedRateLocked(
    existingPosition.netFixedRateLocked,
    existingPosition.netNotionalLocked,
    fixedRateLocked,
    notionalLocked,
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
    vammAddress: vammAddress,
    ownerAddress: ownerAddress,
    tickLower: tickLower,
    tickUpper: tickUpper,
    realizedPnLFromSwaps: existingPosition.realizedPnLFromSwaps + realizedPnLSinceLastSwap,
    realizedPnLFromFeesPaid: existingPosition.realizedPnLFromFeesPaid + feePaidToLps,
    netNotionalLocked: netNotionalLocked,
    netFixedRateLocked: netFixedRateLocked,
    lastUpdatedTimestamp: bigQuery.timestamp(eventTimestamp).value,
    rowLastUpdatedTimestamp: bigQuery.timestamp(rowLastUpdatedTimestamp).value,
    notionalLiquidityProvided: 0,
    realizedPnLFromFeesCollected: 0,
    netMarginDeposited: 0,
  };
};
