import { BigQuery } from '@google-cloud/bigquery';
import { AMM } from '@voltz-protocol/v1-sdk';
import { ethers } from 'ethers';

import {
  insertNewSwapAndNewPosition,
  insertNewSwapAndUpdateExistingPosition,
} from '../big-query-support/insertNewSwapAndNewPosition';
import { pullExistingPositionRow } from '../big-query-support/pullExistingPositionRow';

export const insertNewSwap = async (
  bigQuery: BigQuery,
  amm: AMM,
  eventId: string,
  event: ethers.Event,
): Promise<void> => {
  const address = event.address;
  const recipient = event.args?.recipient as string;
  const tickLower = event.args?.tickLower as number;
  const tickUpper = event.args?.recipient as number;

  // check if a position already exists in the positions table
  const existingPosition = await pullExistingPositionRow(
    bigQuery,
    address,
    recipient,
    tickLower,
    tickUpper,
  );

  if (existingPosition) {
    // this position has already performed a swap
    await insertNewSwapAndUpdateExistingPosition(bigQuery, amm, eventId, event, existingPosition);
  } else {
    // this is the first swap of the position
    await insertNewSwapAndNewPosition(bigQuery, amm, eventId, event);
  }
};
