import { AMM } from '@voltz-protocol/v1-sdk';

import { BigQueryPositionRow } from '../../big-query-support';
import { getLiquidityIndex } from '../../common';
import { SwapEventInfo } from '../../common/event-parsers/parseSwapEvent';
import { generatePositionRow } from '../../common/swaps/generatePositionRow';

type Args = {
  passiveSwapEvents: SwapEventInfo[];
  affectedLps: BigQueryPositionRow[];
  chainId: number;
  amm: AMM;
  eventTimestamp: number;
  eventBlockNumber: number;
};

export const generateLpPositionRowsFromPassiveSwaps = async ({
  passiveSwapEvents,
  affectedLps,
  amm,
  chainId,
  eventTimestamp,
  eventBlockNumber,
}: Args): Promise<BigQueryPositionRow[]> => {
  const positionRows: BigQueryPositionRow[] = [];
  const numberOfSwaps = passiveSwapEvents.length;

  const liquidityIndexAtRootEvent = await getLiquidityIndex(
    chainId,
    amm.provider,
    amm.marginEngineAddress,
    eventBlockNumber,
  );

  for (let i = 0; i < numberOfSwaps; i++) {
    const passiveSwapEvent = passiveSwapEvents[i];
    const affectedLp = affectedLps[i];

    const positionRow = generatePositionRow(
      amm,
      passiveSwapEvent,
      eventTimestamp,
      affectedLp,
      liquidityIndexAtRootEvent,
    );

    positionRows.push(positionRow);
  }

  return positionRows;
};
