import { BigQuery } from '@google-cloud/bigquery';
import { AMM } from '@voltz-protocol/v1-sdk';
import { ethers } from 'ethers';

import { pullExistingSwapRow } from '../big-query-support/pullExistingSwapRow';
import { MIN_ETH_NOTIONAL, MIN_USD_NOTIONAL } from '../common/constants';
import { insertNewSwap } from './insertNewSwap';

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

const processSwap = async (bigQuery: BigQuery, amm: AMM, event: ethers.Event) => {
  const eventId = `${event.blockHash}_${event.transactionHash}_${event.logIndex}`;
  const swapRow = await pullExistingSwapRow(bigQuery, eventId);

  if (!swapRow) {
    await insertNewSwap(bigQuery, amm, eventId, event);
  }
};

export const processSwapEvent = async (
  bigQuery: BigQuery,
  amm: AMM,
  event: ethers.Event,
): Promise<void> => {
  const shouldProcess = shouldProcessSwapEvent(amm, event);

  if (shouldProcess) {
    await processSwap(bigQuery, amm, event);
  }
};
