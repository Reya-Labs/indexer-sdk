import { TrackedBigQueryPositionRow } from '../../big-query-support/pull-data/pullAllPositions';
import { MintOrBurnEventInfo } from '../../common/event-parsers/types';
import { getTimestampInSeconds } from '../../common/utils';

export const processMintOrBurnEventLpSpeed = (
  currentPositions: TrackedBigQueryPositionRow[],
  eventInfo: MintOrBurnEventInfo,
): void => {
  const currentTimestamp = getTimestampInSeconds();

  console.log(`Operating on ${eventInfo.ownerAddress}`);

  const existingPositionIndex = currentPositions.findIndex(({ position }) => {
    return (
      position.chainId === eventInfo.chainId &&
      position.vammAddress === eventInfo.vammAddress &&
      position.ownerAddress === eventInfo.ownerAddress &&
      position.tickLower === eventInfo.tickLower &&
      position.tickUpper === eventInfo.tickUpper
    );
  });

  if (existingPositionIndex === -1) {
    // Position does not exist in the table, add new one
    currentPositions.push({
      position: {
        marginEngineAddress: eventInfo.marginEngineAddress,
        vammAddress: eventInfo.vammAddress,
        ownerAddress: eventInfo.ownerAddress,
        tickLower: eventInfo.tickLower,
        tickUpper: eventInfo.tickUpper,
        realizedPnLFromSwaps: 0,
        realizedPnLFromFeesPaid: 0,
        netNotionalLocked: 0,
        netFixedRateLocked: 0,
        lastUpdatedBlockNumber: eventInfo.blockNumber,
        notionalLiquidityProvided: eventInfo.notionalDelta,
        realizedPnLFromFeesCollected: 0,
        netMarginDeposited: 0,
        rateOracleIndex: eventInfo.amm.rateOracle.protocolId,
        rowLastUpdatedTimestamp: currentTimestamp,
        fixedTokenBalance: 0,
        variableTokenBalance: 0,
        positionInitializationBlockNumber: eventInfo.blockNumber,
        rateOracle: eventInfo.amm.rateOracle.protocol,
        underlyingToken: eventInfo.amm.underlyingToken.name,
        chainId: eventInfo.chainId,
        cashflowLiFactor: 0,
        cashflowTimeFactor: 0,
        cashflowFreeTerm: 0,
        liquidity: eventInfo.liquidityDelta,
      },
      added: true,
      modified: true,
    });
  } else {
    const notionalLiquidityProvided =
      currentPositions[existingPositionIndex].position.notionalLiquidityProvided +
      eventInfo.notionalDelta;

    const liquidity =
      currentPositions[existingPositionIndex].position.liquidity + eventInfo.liquidityDelta;

    // Update the exisiting position
    currentPositions[existingPositionIndex].modified = true;
    currentPositions[existingPositionIndex].position.lastUpdatedBlockNumber = eventInfo.blockNumber;
    currentPositions[existingPositionIndex].position.notionalLiquidityProvided =
      notionalLiquidityProvided;
    currentPositions[existingPositionIndex].position.rowLastUpdatedTimestamp = currentTimestamp;
    currentPositions[existingPositionIndex].position.liquidity = liquidity;
  }
};
