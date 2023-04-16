import { AMM } from '@voltz-protocol/v1-sdk';

import { BigQueryPositionRow } from '../../big-query-support';
import { SwapEventInfo } from '../../common/event-parsers/parseSwapEvent';

type GPassiveSwapEventsArgs = {
  existingLpPositionRows: BigQueryPositionRow[];
  amm: AMM;
  rootEventInfo: SwapEventInfo;
};

export const generatePassiveSwapEvents = async ({
  existingLpPositionRows,
  amm,
  rootEventInfo,
}: GPassiveSwapEventsArgs): Promise<{
  passiveSwapEvents: SwapEventInfo[];
  affectedLps: BigQueryPositionRow[];
}> => {
  // Retrieve amm info
  const startTimestamp = Math.floor(amm.termStartTimestampInMS / 1000);
  const maturityTimestamp = Math.floor(amm.termEndTimestampInMS / 1000);

  const tokenDecimals = amm.underlyingToken.decimals;

  const passiveSwapEvents: SwapEventInfo[] = [];
  const affectedLps: BigQueryPositionRow[] = [];

  for (const positionRow of existingLpPositionRows) {
    if (positionRow.lastUpdatedTimestamp < rootEventInfo.eventTimestamp) {
      // position is initialized before event timestamp
      const ownerAddress = positionRow.ownerAddress;
      const tickLower = positionRow.tickLower;
      const tickUpper = positionRow.tickUpper;
    }
  }

  return { passiveSwapEvents, affectedLps };
};
