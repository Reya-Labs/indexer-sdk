import { BigQuery } from "@google-cloud/bigquery";
import { SwapEventInfo } from "../../common/event-parsers";
import { generateLpPositionUpdatesQuery, pullExistingLpPositionRows } from "../../big-query-support";
import { generateLpPositionRowsFromPassiveSwaps } from "../../lp-pnl/processPassiveSwapEvents/generateLpPositionRowsFromPassiveSwaps";

export const processSwapEventLpSpeed = async (bigQuery: BigQuery, rootEventInfo: SwapEventInfo): Promise<void> => {

  // Retrieve all LPs
  const existingLpPositionRows = await pullExistingLpPositionRows(
    bigQuery,
    rootEventInfo.amm.id,
    rootEventInfo.eventTimestamp,
  );


  const { passiveSwapEvents, affectedLps } = await gPassiveSwapEvents({
    existingLpPositionRows,
    amm: rootEventInfo.amm,
    rootEventInfo
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

}