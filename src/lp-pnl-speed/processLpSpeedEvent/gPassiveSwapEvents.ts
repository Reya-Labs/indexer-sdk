import { AMM } from '@voltz-protocol/v1-sdk';
import { ethers } from 'ethers';

import { BigQueryPositionRow } from '../../big-query-support';
import { VAMMPriceChangeEventInfo } from '../../common/event-parsers';
import { SwapEventInfo } from '../../common/event-parsers/parseSwapEvent';
import {
  calculatePassiveTokenDeltas,
  PassiveTokenDeltas,
} from '../../common/lp-math/calculatePassiveTokenDeltas';

type GPassiveSwapEventsArgs = {
  existingLpPositionRows: BigQueryPositionRow[];
  amm: AMM;
  priceChangeEventInfo: VAMMPriceChangeEventInfo;
};

export const gPassiveSwapEvents = ({
  existingLpPositionRows,
  amm,
  priceChangeEventInfo,
}: GPassiveSwapEventsArgs):{
  passiveSwapEvents: SwapEventInfo[];
  affectedLps: BigQueryPositionRow[];
} => {
  const tokenDecimals = amm.underlyingToken.decimals;

  const passiveSwapEvents: SwapEventInfo[] = [];
  const affectedLps: BigQueryPositionRow[] = [];

  for (const positionRow of existingLpPositionRows) {
    // note, block number is not sufficient since tx ordering within the block also matters
    if (positionRow.lastUpdatedBlockNumber < priceChangeEventInfo.eventBlockNumber) {
      // position is initialized before event timestamp
      const ownerAddress = positionRow.ownerAddress;
      const tickLower = positionRow.tickLower;
      const tickUpper = positionRow.tickUpper;
      const tickPrevious = positionRow.tickPrevious;

      const { variableTokenDeltaString, fixedTokenDeltaUnbalancedString }: PassiveTokenDeltas =
        calculatePassiveTokenDeltas(
          positionRow.liquidity,
          tickUpper,
          tickLower,
          priceChangeEventInfo.tick,
          tickPrevious,
        );

      const variableTokenDelta = Number(
        ethers.utils.formatUnits(variableTokenDeltaString, tokenDecimals),
      );

      const fixedTokenDeltaUnbalanced = Number(
        ethers.utils.formatUnits(fixedTokenDeltaUnbalancedString, tokenDecimals),
      );

      // note, what if there are two in the same block...
      const passiveSwapEventId =
        `${priceChangeEventInfo.chainId}_${priceChangeEventInfo.vammAddress}_${ownerAddress}_${priceChangeEventInfo.eventBlockNumber}`.toLowerCase();

      const passiveSwapEvent: SwapEventInfo = {
        eventId: passiveSwapEventId,
        eventBlockNumber: priceChangeEventInfo.eventBlockNumber,
        chainId: priceChangeEventInfo.chainId,
        vammAddress: priceChangeEventInfo.vammAddress,
        ownerAddress,
        tickLower,
        tickUpper,
        variableTokenDelta,
        fixedTokenDeltaUnbalanced,
        feePaidToLps: 0, // does not apply to passive swaps
        rateOracle: priceChangeEventInfo.rateOracle,
        underlyingToken: priceChangeEventInfo.underlyingToken,
        marginEngineAddress: priceChangeEventInfo.marginEngineAddress,
        amm: priceChangeEventInfo.amm,
        type: 'swap'
      };

      passiveSwapEvents.push(passiveSwapEvent);

      affectedLps.push({
        ...positionRow,
        tickPrevious: priceChangeEventInfo.tick,
      });
    } else {
      throw Error('Position is in the future');
    }
  }

  return { passiveSwapEvents, affectedLps };
};
