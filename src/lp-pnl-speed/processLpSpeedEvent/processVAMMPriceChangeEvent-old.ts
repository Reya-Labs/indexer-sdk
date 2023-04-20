import { pullExistingLpPositionRows } from '../../big-query-support/pull-data/pullExistingLpPositionRows';
import { generateLpPositionUpdatesQuery } from '../../big-query-support/push-data/generateLpPositionUpdatesQuery';
import { generatePositionRow } from '../../big-query-support/push-data/generatePositionRow';
import { VAMMPriceChangeEventInfo } from '../../common/event-parsers/types';
import { getLiquidityIndex } from '../../common/services/getLiquidityIndex';
import { getBigQuery } from '../../global';
import { generatePassiveSwapEvents } from './generatePassiveSwapEvents';

export const processVAMMPriceChangeEvent = async (
  priceChangeEventInfo: VAMMPriceChangeEventInfo,
  previousTick: number,
): Promise<void> => {
  const bigQuery = getBigQuery();

  let trackingTime = Date.now().valueOf();

  // Pull all LP positions
  const existingLpPositionRows = await pullExistingLpPositionRows(
    priceChangeEventInfo.amm.id,
    priceChangeEventInfo.blockNumber,
  );

  console.log(`Update tick: Fetching all positions took ${Date.now().valueOf() - trackingTime} ms`);
  trackingTime = Date.now().valueOf();

  // Generate passive swap events
  const passiveSwapEvents = generatePassiveSwapEvents({
    existingLpPositionRows,
    priceChangeEventInfo,
    previousTick,
  });

  console.log(
    `Update tick: Generating passive swaps took ${Date.now().valueOf() - trackingTime} ms`,
  );
  trackingTime = Date.now().valueOf();

  // Skip if there is no affected LP
  if (passiveSwapEvents.length === 0) {
    return;
  }

  console.log(`Updating ${passiveSwapEvents.length} LPs due to tick change.`);

  // Retrieve event timestamp
  const eventTimestamp = (
    await priceChangeEventInfo.amm.provider.getBlock(priceChangeEventInfo.blockNumber)
  ).timestamp;

  console.log(
    `Update tick: Grabbing block event timestamp took ${Date.now().valueOf() - trackingTime} ms`,
  );
  trackingTime = Date.now().valueOf();

  // Retrieve liquidity index at the event block
  const liquidityIndexAtRootEvent = await getLiquidityIndex(
    priceChangeEventInfo.chainId,
    priceChangeEventInfo.amm.provider,
    priceChangeEventInfo.amm.marginEngineAddress,
    priceChangeEventInfo.blockNumber,
  );

  console.log(
    `Update tick: Fetching liquidity index took ${Date.now().valueOf() - trackingTime} ms`,
  );
  trackingTime = Date.now().valueOf();

  // Generate all passive swap events
  const lpPositionRows = passiveSwapEvents.map(({ affectedLP, passiveSwapEvent }) =>
    generatePositionRow(
      priceChangeEventInfo.amm,
      passiveSwapEvent,
      eventTimestamp,
      affectedLP,
      liquidityIndexAtRootEvent,
    ),
  );

  console.log(
    `Update tick: Generating position rows took ${Date.now().valueOf() - trackingTime} ms`,
  );
  trackingTime = Date.now().valueOf();

  // Update all affected LPs
  const sqlTransactionQuery = generateLpPositionUpdatesQuery(lpPositionRows);

  const options = {
    query: sqlTransactionQuery,
    timeoutMs: 100000,
    useLegacySql: false,
  };

  await bigQuery.query(options);

  console.log(`Update tick: BigQuery update took ${Date.now().valueOf() - trackingTime} ms`);
  trackingTime = Date.now().valueOf();
};
