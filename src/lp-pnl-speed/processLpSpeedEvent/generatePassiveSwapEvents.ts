import { BigQueryPositionRow } from '../../big-query-support';
import { SwapEventInfo, VAMMPriceChangeEventInfo } from '../../common/event-parsers';
import { calculatePassiveTokenDeltas } from '../../common/services/calculatePassiveTokenDeltas';

type Args = {
  existingLpPositionRows: BigQueryPositionRow[];
  priceChangeEventInfo: VAMMPriceChangeEventInfo;
};

export const generatePassiveSwapEvents = ({
  existingLpPositionRows,
  priceChangeEventInfo,
}: Args): {
  affectedLP: BigQueryPositionRow;
  passiveSwapEvent: SwapEventInfo;
}[] => {
  const affectedLPs = existingLpPositionRows.map((affectedLP) => {
    const { ownerAddress, tickLower, tickUpper, tickPrevious, liquidity } = affectedLP;
    const currentTick = priceChangeEventInfo.tick;

    const { variableTokenDelta, fixedTokenDeltaUnbalanced } = calculatePassiveTokenDeltas(
      liquidity,
      tickLower,
      tickUpper,
      tickPrevious,
      currentTick,
    );

    const passiveSwapEventId = `${priceChangeEventInfo.chainId}_${priceChangeEventInfo.vammAddress}_${ownerAddress}_${priceChangeEventInfo.eventBlockNumber}`;

    const passiveSwapEvent: SwapEventInfo = {
      eventId: passiveSwapEventId.toLowerCase(),
      type: 'swap',
      eventBlockNumber: priceChangeEventInfo.eventBlockNumber,

      chainId: priceChangeEventInfo.chainId,
      vammAddress: priceChangeEventInfo.vammAddress,
      amm: priceChangeEventInfo.amm,

      rateOracle: priceChangeEventInfo.rateOracle,
      underlyingToken: priceChangeEventInfo.underlyingToken,
      marginEngineAddress: priceChangeEventInfo.marginEngineAddress,

      ownerAddress,
      tickLower,
      tickUpper,

      variableTokenDelta,
      fixedTokenDeltaUnbalanced,
      feePaidToLps: 0, // does not apply to passive swaps
    };

    return {
      affectedLP: {
        ...affectedLP,
        tickPrevious: priceChangeEventInfo.tick,
      },
      passiveSwapEvent,
    };
  });

  return affectedLPs;
};
