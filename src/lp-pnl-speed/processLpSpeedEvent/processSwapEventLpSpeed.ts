import { BigQuery } from '@google-cloud/bigquery';

import {
  generateLpPositionUpdatesQuery,
  pullExistingLpPositionRows,
} from '../../big-query-support';
import { SwapEventInfo } from '../../common/event-parsers';
import { generateLpPositionRowsFromPassiveSwaps } from '../../lp-pnl/processPassiveSwapEvents/generateLpPositionRowsFromPassiveSwaps';


// https://github.com/Voltz-Protocol/voltz-core/blob/09aa40b7159de6256f14615292b9e0d1b50d7399/contracts/VAMM.sol#L711
// todo: rename this to processVAMMPriceChangeEvent event
export const processSwapEventLpSpeed = async (
  bigQuery: BigQuery,
  rootEventInfo: SwapEventInfo,
): Promise<void> => {
  // Retrieve all LPs
  const existingLpPositionRows = await pullExistingLpPositionRows(
    bigQuery,
    rootEventInfo.amm.id,
    rootEventInfo.eventTimestamp,
  );

  const { passiveSwapEvents, affectedLps } = await gPassiveSwapEvents({
    existingLpPositionRows,
    amm: rootEventInfo.amm,
    rootEventInfo,
  });

  if (affectedLps.length === 0) {
    // since the latest checkpoint, no lps were affected by passive swaps
    return;
  }

  const lpPositionRows = await generateLpPositionRowsFromPassiveSwaps({
    passiveSwapEvents,
    affectedLps,
    chainId: rootEventInfo.chainId,
    amm: rootEventInfo.amm,
    eventTimestamp: rootEventInfo.eventTimestamp,
    eventBlockNumber: rootEventInfo.eventBlockNumber,
  });

  const sqlTransactionQuery = generateLpPositionUpdatesQuery(lpPositionRows);

  const options = {
    query: sqlTransactionQuery,
    timeoutMs: 100000,
    useLegacySql: false,
  };

  await bigQuery.query(options);
};
