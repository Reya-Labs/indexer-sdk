import { BigQuery } from '@google-cloud/bigquery';
import { AMM } from '@voltz-protocol/v1-sdk';

import { BigQueryPositionRow } from '../../big-query-support';
import { generatePositionRow } from '../../common/swaps/generatePositionRow';
import { SwapEventInfo } from '../../common/swaps/parseSwapEvent';

export type GenerateLpPositionRowsFromPassiveSwapsArgs = {
  passiveSwapEvents: SwapEventInfo[];
  affectedLps: BigQueryPositionRow[];
  bigQuery: BigQuery;
  chainId: number;
  amm: AMM;
  currentTimestamp: number;
};

// todo: check if we also need to pass the chainId and the bigQuery object in here
export const generateLpPositionRowsFromPassiveSwaps = async ({
  passiveSwapEvents,
  affectedLps,
  amm,
  currentTimestamp,
}: GenerateLpPositionRowsFromPassiveSwapsArgs): Promise<BigQueryPositionRow[]> => {
  if (passiveSwapEvents.length !== affectedLps.length || passiveSwapEvents.length === 0) {
    return [];
  }

  const positionRows: BigQueryPositionRow[] = [];
  const numberOfSwaps = passiveSwapEvents.length;

  for (let i = 0; i < numberOfSwaps; i++) {
    const passiveSwapEvent: SwapEventInfo = passiveSwapEvents[i];
    const affectedLp: BigQueryPositionRow = affectedLps[i];
    const positionRow: BigQueryPositionRow = await generatePositionRow(
      amm,
      passiveSwapEvent,
      currentTimestamp,
      affectedLp,
    );
    positionRows.push(positionRow);
  }

  return positionRows;
};
