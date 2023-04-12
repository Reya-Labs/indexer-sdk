import { AMM } from '@voltz-protocol/v1-sdk';

import { BigQueryPositionRow } from '../../big-query-support';
import { getVariableFactor } from '../../common';
import { generateMarginEngineContract } from '../../common/contract-services/generateMarginEngineContract';
import { SwapEventInfo } from '../../common/swaps/parseSwapEvent';
import { generatePassiveSwapEvent } from './generatePassiveSwapEvent';
import { getOnChainFixedAndVariableTokenBalances } from './getOnChainFixedAndVariableTokenBalances';

type GeneratePassiveSwapEventsArgs = {
  existingLpPositionRows: BigQueryPositionRow[];
  amm: AMM;
  rootEventInfo: SwapEventInfo;
  eventTimestamp: number;
};

export const generatePassiveSwapEvents = async ({
  existingLpPositionRows,
  amm,
  rootEventInfo,
  eventTimestamp,
}: GeneratePassiveSwapEventsArgs): Promise<{
  passiveSwapEvents: SwapEventInfo[];
  affectedLps: BigQueryPositionRow[];
}> => {
  // Retrieve amm info
  const startTimestamp = Math.floor(amm.termStartTimestampInMS / 1000);
  const maturityTimestamp = Math.floor(amm.termEndTimestampInMS / 1000);

  const tokenDecimals = amm.underlyingToken.decimals;

  // Get variable factor before start and event timestamp (for excess balance)
  const variableFactorStartToCurrent = await getVariableFactor(
    amm.provider,
    amm.rateOracle.id,
    startTimestamp,
    eventTimestamp,
    rootEventInfo.eventBlockNumber,
  );

  // Fetch the margin engine contract
  const marginEngineContract = generateMarginEngineContract(amm.marginEngineAddress, amm.provider);

  const passiveSwapEvents: SwapEventInfo[] = [];
  const affectedLps: BigQueryPositionRow[] = [];

  for (const positionRow of existingLpPositionRows) {
    if (positionRow.lastUpdatedTimestamp < eventTimestamp) {
      // position is initialized before event timestamp
      const ownerAddress = positionRow.ownerAddress;
      const tickLower = positionRow.tickLower;
      const tickUpper = positionRow.tickUpper;

      const { onChainVariableTokenBalance, onChainFixedTokenBalance } =
        await getOnChainFixedAndVariableTokenBalances({
          marginEngineContract,
          ownerAddress,
          tickLower,
          tickUpper,
          tokenDecimals,
          blockNumber: rootEventInfo.eventBlockNumber,
        });

      const variableTokenDelta = onChainVariableTokenBalance - positionRow.variableTokenBalance;
      const fixedTokenDelta = onChainFixedTokenBalance - positionRow.fixedTokenBalance;

      if (Math.abs(variableTokenDelta) === 0 && Math.abs(fixedTokenDelta) === 0) {
        console.log(`Zero deltas. LP not affected.`);
      } else {
        const passiveSwap: SwapEventInfo = generatePassiveSwapEvent({
          variableTokenDelta,
          fixedTokenDelta,
          ownerAddress,
          tickLower,
          tickUpper,
          eventTimestamp,
          startTimestamp,
          maturityTimestamp,
          variableFactorStartToCurrent,
          rootEventInfo,
        });
        passiveSwapEvents.push(passiveSwap);
        affectedLps.push({
          ...positionRow,
          variableTokenBalance: onChainVariableTokenBalance,
          fixedTokenBalance: onChainFixedTokenBalance,
        });
      }
    } else {
      console.log(`This lp position was initialized in the future relative to event.`);
    }
  }

  return { passiveSwapEvents, affectedLps };
};
