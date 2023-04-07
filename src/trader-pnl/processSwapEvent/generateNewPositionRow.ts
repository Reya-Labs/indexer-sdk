import { BigQuery } from '@google-cloud/bigquery';
import { AMM } from '@voltz-protocol/v1-sdk';

import { getTimestampInSeconds } from '../../common';
import { SwapEventInfo } from './parseSwapEvent';

export const generateNewPositionRow = (
  bigQuery: BigQuery,
  amm: AMM,
  eventInfo: SwapEventInfo,
  eventTimestamp: number,
) => {
  const rowLastUpdatedTimestamp = getTimestampInSeconds();

  // todo: add variable and fixed token balances to the row
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
    lastUpdatedTimestamp: bigQuery.timestamp(eventTimestamp).value,
    rowLastUpdatedTimestamp: bigQuery.timestamp(rowLastUpdatedTimestamp).value,
    notionalLiquidityProvided: 0,
    realizedPnLFromFeesCollected: 0,
    netMarginDeposited: 0,
  };
};
