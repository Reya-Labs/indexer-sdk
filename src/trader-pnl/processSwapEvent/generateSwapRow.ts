import { BigQuery } from '@google-cloud/bigquery';
import { AMM } from '@voltz-protocol/v1-sdk';
import { ethers } from 'ethers';

import { getTimestampInSeconds } from '../../common';
import { parseSwapEvent } from './parseSwapEvent';

export const generateSwapRow = async (
  bigQuery: BigQuery,
  amm: AMM,
  eventId: string,
  event: ethers.Event,
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

  return {
    eventId: eventId,
    vammAddress,
    ownerAddress,
    tickLower,
    tickUpper,
    notionalLocked,
    fixedRateLocked,
    feePaidToLps,
    eventTimestamp: bigQuery.timestamp(eventTimestamp).value,
    rowLastUpdatedTimestamp: bigQuery.timestamp(rowLastUpdatedTimestamp).value,
  };
};
