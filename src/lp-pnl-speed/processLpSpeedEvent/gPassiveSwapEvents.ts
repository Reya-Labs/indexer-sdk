import { AMM } from '@voltz-protocol/v1-sdk';
import { BigQueryPositionRow } from '../../big-query-support';
import { SwapEventInfo } from '../../common/event-parsers/parseSwapEvent';
import { VAMMPriceChangeEventInfo } from '../../common/event-parsers';

type GPassiveSwapEventsArgs = {
  existingLpPositionRows: BigQueryPositionRow[];
  amm: AMM;
  priceChangeEventInfo: VAMMPriceChangeEventInfo;
};

export const gPassiveSwapEvents = async ({
  existingLpPositionRows,
  amm,
  priceChangeEventInfo,
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


    if (positionRow.lastUpdatedTimestamp < priceChangeEventInfo.eventTimestamp) {

      // position is initialized before event timestamp
      const ownerAddress = positionRow.ownerAddress;
      const tickLower = positionRow.tickLower;
      const tickUpper = positionRow.tickUpper;

      

      


      

    } else {
        throw Error("Position is in the future");
    }
  }

  return { passiveSwapEvents, affectedLps };
};
