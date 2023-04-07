import { BigQuery } from '@google-cloud/bigquery';
import { AMM } from '@voltz-protocol/v1-sdk';
import { ethers } from 'ethers';

import { pullExistingPositionRow, pullExistingSwapRow } from '../../big-query-support';
import { MIN_ETH_NOTIONAL, MIN_USD_NOTIONAL } from '../../common';
import { insertNewSwapAndNewPosition } from './insertNewSwapAndNewPosition';
import { insertNewSwapAndUpdateExistingPosition } from './insertNewSwapAndUpdateExistingPosition';

function shouldProcessSwapEvent(amm: AMM, event: ethers.Event): boolean {
  const variableTokenDelta = event.args?.variableTokenDelta as ethers.BigNumber;
  const notionalExecuted = Number(
    ethers.utils.formatUnits(variableTokenDelta, amm.underlyingToken.decimals),
  );
  let shouldProcess = true;

  if (amm.isETH) {
    if (notionalExecuted < MIN_ETH_NOTIONAL) {
      shouldProcess = false;
    }
  } else {
    if (notionalExecuted < MIN_USD_NOTIONAL) {
      shouldProcess = false;
    }
  }

  return shouldProcess;
}

export const processSwapEvent = async (
  bigQuery: BigQuery,
  amm: AMM,
  event: ethers.Event,
): Promise<void> => {
  const shouldProcess = shouldProcessSwapEvent(amm, event);

  if (!shouldProcess) {
    // swap should not be processed, skip
    return;
  }

  const eventId = `${event.blockHash}_${event.transactionHash}_${event.logIndex}`;
  const swapRow = await pullExistingSwapRow(bigQuery, eventId);

  if (swapRow) {
    // swap already processed, skip
    return;
  }

  // decode event
  const address = event.address;
  const recipient = event.args?.recipient as string;
  const tickLower = event.args?.tickLower as number;
  const tickUpper = event.args?.tickUpper as number;

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
