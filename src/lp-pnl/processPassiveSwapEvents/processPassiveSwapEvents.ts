import { BigQuery } from '@google-cloud/bigquery';
import { AMM } from '@voltz-protocol/v1-sdk';
import { BigNumber, ethers } from 'ethers';
import { pullExistingLpPositionRows } from '../../big-query-support';
import { parseSwapEvent } from '../../common/swaps/parseSwapEvent';
import { generateLpPositionUpdatesQuery } from './generateLpPositionUpdatesQuery';
import { generateLpPositionRowsFromPassiveSwaps } from './generateLpPositionRowsFromPassiveSwaps';
import { generatePassiveSwapEvents } from './generatePassiveSwapEvents';

function shouldProcessSwapEvent(): boolean {

  // todo: this function needs to be time-dependent -> need to elaborate

  return true;
}

export const processPassiveSwapEvents = async (
  bigQuery: BigQuery,
  amm: AMM,
  event: ethers.Event,
): Promise<void> => {
  const eventInfo = parseSwapEvent(amm, event);
  // todo: get back to this
  const shouldProcess = shouldProcessSwapEvent();

  if (!shouldProcess) {
    console.log('Swap event skipped.');
    // swap should not be processed in order to extract passive swap events processed by lps
    return;
  }

  const eventTimestamp = (await event.getBlock()).timestamp;

  // currently not able to filter by e.g. vamm address of the swap because we're skipping a lot of swaps
  // for performance reasons, however we should still filter out lps that have their first mint in the
  // future relative to the eventTimestamp since we're processing all the mint events before jumping on passive swaps
  const existingLpPositionRows = await pullExistingLpPositionRows(bigQuery, eventTimestamp); // needs a type, check what's used for traders
  const marginEngineAddress: string = amm.marginEngineAddress.toLowerCase();
  const ammStartTimestampInMS: number = amm.termStartTimestampInMS;
  const eventTimestampInMS: number = eventTimestamp * 1000;
  const variableFactor: number = (await amm.variableFactor(
    ammStartTimestampInMS,
    eventTimestampInMS
  )).scaled;

  const tokenDecimals: number = amm.underlyingToken.decimals;

  // todo: get back to this once generatePassiveSwapEvents is implemented
  const {passiveSwapEvents, affectedLps} = await generatePassiveSwapEvents();

  // todo: return once implementation is ready
  const lpPositionRows = await generateLpPositionRowsFromPassiveSwaps(passiveSwapEvents,affectedLps, bigQuery);

  if (lpPositionRows.length === 0) { 
    // since the latest checkpoint, no lps were affected by passive swaps
    return;
  }

  // todo: return once implementation done
  const sqlTransactionQuery = generateLpPositionUpdatesQuery(lpPositionRows);

  const options = {
    query: sqlTransactionQuery,
    timeoutMs: 100000,
    useLegacySql: false,
  };

  await bigQuery.query(options);

  console.log(
    `Updated ${lpPositionRows.length} from passive swaps`,
  );

};
