import { BigQueryPositionRow } from '../../big-query-support/pull-data/types';
import { SwapEventInfo, VAMMPriceChangeEventInfo } from '../../common/event-parsers/types';
import { calculatePassiveTokenDeltas } from '../../common/services/calculatePassiveTokenDeltas';

type Args = {
  existingLpPositionRows: BigQueryPositionRow[];
  priceChangeEventInfo: VAMMPriceChangeEventInfo;
  previousTick: number;
};

export const generatePassiveSwapEvents = ({
  existingLpPositionRows,
  priceChangeEventInfo,
  previousTick,
}: Args): {
  affectedLP: BigQueryPositionRow;
  passiveSwapEvent: SwapEventInfo;
}[] => {
  const affectedLPs = existingLpPositionRows.map((affectedLP) => {
    const { ownerAddress, tickLower, tickUpper, liquidity } = affectedLP;
    const currentTick = priceChangeEventInfo.tick;

    const { variableTokenDelta, fixedTokenDeltaUnbalanced } = calculatePassiveTokenDeltas(
      liquidity,
      tickLower,
      tickUpper,
      previousTick,
      currentTick,
    );

    console.log(`Tick has moved from ${previousTick} to ${currentTick}...`);
    console.log(`generating ${variableTokenDelta} VT and ${fixedTokenDeltaUnbalanced} uFT`);
    console.log();

    // todo: enhance this ID -> not high pro as long as we do not add them to the table
    const passiveSwapEventId = `id`;

    const passiveSwapEvent: SwapEventInfo = {
      ...priceChangeEventInfo,

      eventId: passiveSwapEventId.toLowerCase(),
      type: 'swap',

      ownerAddress,
      tickLower,
      tickUpper,

      variableTokenDelta,
      fixedTokenDeltaUnbalanced,
      feePaidToLps: 0, // does not apply to passive swaps
    };

    return {
      affectedLP,
      passiveSwapEvent,
    };
  });

  return affectedLPs;
};
