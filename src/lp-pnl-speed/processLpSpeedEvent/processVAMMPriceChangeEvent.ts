import { TrackedBigQueryPositionRow } from '../../big-query-support/pull-data/pullAllPositions';
import { generatePositionRow } from '../../big-query-support/push-data/generatePositionRow';
import { SECONDS_IN_YEAR } from '../../common/constants';
import { SwapEventInfo, VAMMPriceChangeEventInfo } from '../../common/event-parsers/types';
import { calculatePassiveTokenDeltas } from '../../common/services/calculatePassiveTokenDeltas';
import { getLiquidityIndex } from '../../common/services/getLiquidityIndex';

export const processVAMMPriceChangeEvent = async (
  currentPositions: TrackedBigQueryPositionRow[],
  priceChangeEventInfo: VAMMPriceChangeEventInfo,
  previousTick: number,
): Promise<void> => {
  const currentTick = priceChangeEventInfo.tick;

  // Retrieve event timestamp
  const eventTimestamp = (
    await priceChangeEventInfo.amm.provider.getBlock(priceChangeEventInfo.blockNumber)
  ).timestamp;

  // Retrieve liquidity index at the event block
  const liquidityIndexAtRootEvent = await getLiquidityIndex(
    priceChangeEventInfo.chainId,
    priceChangeEventInfo.amm.provider,
    priceChangeEventInfo.amm.marginEngineAddress,
    priceChangeEventInfo.blockNumber,
  );

  for (let i = 0; i < currentPositions.length; i++) {
    const { position } = currentPositions[i];

    if (!(position.vammAddress === priceChangeEventInfo.amm.id)) {
      continue;
    }

    if (position.notionalLiquidityProvided <= 0) {
      continue;
    }

    if (position.positionInitializationBlockNumber >= priceChangeEventInfo.blockNumber) {
      continue;
    }

    const { ownerAddress, tickLower, tickUpper, liquidity } = position;

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

    // Generate all passive swap events

    currentPositions[i].modified = true;
    currentPositions[i].position = generatePositionRow(
      priceChangeEventInfo.amm,
      passiveSwapEvent,
      eventTimestamp,
      position,
      liquidityIndexAtRootEvent,
    );

    {
      const { cashflowLiFactor, cashflowTimeFactor, cashflowFreeTerm } =
        currentPositions[i].position;
      const uPnL =
        liquidityIndexAtRootEvent * cashflowLiFactor +
        (eventTimestamp * cashflowTimeFactor) / SECONDS_IN_YEAR +
        cashflowFreeTerm;
      console.log(`current uPnL of position ${i}: ${uPnL}`);
    }
  }
};
