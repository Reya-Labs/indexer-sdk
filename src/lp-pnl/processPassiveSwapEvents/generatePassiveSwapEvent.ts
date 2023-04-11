import { SwapEventInfo } from '../../common/swaps/parseSwapEvent';
import { getFixedRateLockedFromBalances } from './getFixedRateLockedFromBalances';

export type GeneratePassiveSwapEventArgs = {
  cachedVariableTokenBalance: number;
  cachedFixedTokenBalance: number;
  onChainVariableTokenBalance: number;
  onChainFixedTokenBalance: number;
  chainId: number;
  ownerAddress: string;
  tickLower: number;
  tickUpper: number;
  currentTimestamp: number;
  startTimestamp: number;
  maturityTimestamp: number;
  variableFactor: number;
  rootSwapEvent: SwapEventInfo;
};

export const generatePassiveSwapEvent = ({
  cachedVariableTokenBalance,
  cachedFixedTokenBalance,
  onChainVariableTokenBalance,
  onChainFixedTokenBalance,
  chainId,
  ownerAddress,
  tickLower,
  tickUpper,
  currentTimestamp,
  startTimestamp,
  maturityTimestamp,
  variableFactor,
  rootSwapEvent,
}: GeneratePassiveSwapEventArgs): SwapEventInfo => {
  const notionalLocked = cachedVariableTokenBalance - onChainVariableTokenBalance;
  const fixedRateLocked = getFixedRateLockedFromBalances({
    notionalLocked,
    cachedFixedTokenBalance,
    onChainFixedTokenBalance,
    currentTimestamp,
    startTimestamp,
    maturityTimestamp,
    variableFactor,
  });

  // todo: come up with an id structure for passive swap: not high prio
  const eventId = `id`;
  const rateOracle = rootSwapEvent.rateOracle;
  const underlyingToken = rootSwapEvent.underlyingToken;
  const marginEngineAddress = rootSwapEvent.marginEngineAddress;
  const vammAddress = rootSwapEvent.vammAddress;
  // doesn't apply to passive swaps (since fee income of lps is accounted for separately)
  const feePaidToLps = 0;

  const passiveSwapEvent = {
    eventId,
    chainId,
    vammAddress,
    ownerAddress,
    tickLower,
    tickUpper,
    notionalLocked,
    fixedRateLocked,
    feePaidToLps,
    rateOracle,
    underlyingToken,
    marginEngineAddress,
  };

  return passiveSwapEvent;
};
