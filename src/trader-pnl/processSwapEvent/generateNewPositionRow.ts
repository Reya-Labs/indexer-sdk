import { BigQuery } from '@google-cloud/bigquery';
import { AMM } from '@voltz-protocol/v1-sdk';
import { ethers } from 'ethers';

import { getTimestampInSeconds } from '../../common';
import { parseSwapEvent } from './parseSwapEvent';

export const generateNewPositionRow = async (bigQuery: BigQuery, amm: AMM, event: ethers.Event) => {
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

  // todo: add variable and fixed token balances to the row
  return {
    marginEngineAddress: amm.marginEngineAddress,
    vammAddress: vammAddress,
    ownerAddress: ownerAddress,
    tickLower: tickLower,
    tickUpper: tickUpper,
    realizedPnLFromSwaps: 0,
    realizedPnLFromFeesPaid: feePaidToLps,
    netNotionalLocked: notionalLocked,
    netFixedRateLocked: fixedRateLocked,
    lastUpdatedTimestamp: bigQuery.timestamp(eventTimestamp).value,
    rowLastUpdatedTimestamp: bigQuery.timestamp(rowLastUpdatedTimestamp).value,
    notionalLiquidityProvided: 0,
    realizedPnLFromFeesCollected: 0,
    netMarginDeposited: 0,
  };
};
