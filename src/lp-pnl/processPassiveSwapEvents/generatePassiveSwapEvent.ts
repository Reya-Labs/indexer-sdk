import { getFixedRateLockedFromBalances } from '../../common/services';
import { SwapEventInfo } from '../../common/swaps/parseSwapEvent';

export type GeneratePassiveSwapEventArgs = {
  ownerAddress: string;
  tickLower: number;
  tickUpper: number;

  variableTokenDelta: number;
  fixedTokenDelta: number;

  eventTimestamp: number;

  startTimestamp: number;
  maturityTimestamp: number;

  variableFactorStartToCurrent: number;
  rootEventInfo: SwapEventInfo;
};

export const generatePassiveSwapEvent = ({
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
}: GeneratePassiveSwapEventArgs): SwapEventInfo => {
  const fixedRateLocked = getFixedRateLockedFromBalances({
    variableTokenDelta,
    fixedTokenDelta,
    currentTimestamp: eventTimestamp,
    startTimestamp,
    maturityTimestamp,
    variableFactorStartToCurrent,
  });

  // todo: come up with an id structure for passive swap: not high prio
  const eventId = `id`;

  const passiveSwapEvent: SwapEventInfo = {
    eventId,
    eventBlockNumber: rootEventInfo.eventBlockNumber,
    chainId: rootEventInfo.chainId,
    vammAddress: rootEventInfo.vammAddress,
    ownerAddress,
    tickLower,
    tickUpper,
    notionalLocked: variableTokenDelta,
    fixedRateLocked,
    feePaidToLps: 0, // does not apply to passive swaps
    rateOracle: rootEventInfo.rateOracle,
    underlyingToken: rootEventInfo.underlyingToken,
    marginEngineAddress: rootEventInfo.marginEngineAddress,
  };

  return passiveSwapEvent;
};
