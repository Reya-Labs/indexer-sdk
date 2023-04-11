import { BigQuery } from '@google-cloud/bigquery';
import { AMM } from '@voltz-protocol/v1-sdk';

import { BigQueryPositionRow } from '../../big-query-support';
import { generatePositionRow } from '../../common/swaps/generatePositionRow';
import { SwapEventInfo } from '../../common/swaps/parseSwapEvent';

type Args = {
  passiveSwapEvents: SwapEventInfo[];
  affectedLps: BigQueryPositionRow[];
  bigQuery: BigQuery;
  chainId: number;
  amm: AMM;
  currentTimestamp: number;
};

export const generateLpPositionRowsFromPassiveSwaps = async ({
  passiveSwapEvents,
  affectedLps,
  amm,
  currentTimestamp,
}: Args): Promise<BigQueryPositionRow[]> => {
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
