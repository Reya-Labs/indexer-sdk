import { SwapEventInfo } from '../../common/swaps/parseSwapEvent';



export type GeneratePassiveSwapEventArgs = {

    cachedVariableTokenBalance: number, 
    cachedFixedTokenBalance: number,
    onChainVariableTokenBalance: number,
    onChainFixedTokenBalance: number, 
    chainId: number,
    ownerAddress: string,
    tickLower: number,
    tickUpper: number,
    currentTimestamp: number,
    startTimestamp: number,
    maturityTimestamp: number,
    variableFactor: number,
    rootSwapEvent: SwapEventInfo

}

export const generatePassiveSwapEvent = async ({
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
    rootSwapEvent
}: GeneratePassiveSwapEventArgs): Promise<SwapEventInfo> => {

    const notionalLocked = cachedVariableTokenBalance-onChainVariableTokenBalance;
    // todo: get back when implementation
    const fixedRateLocked = await getFixedRateLockedFromBalances();

    // todo: come up with an id structure for passive swap: not high prio
    const eventId = `id`;
    const rateOracle = rootSwapEvent.rateOracle;
    const underlyingToken = rootSwapEvent.underlyingToken;
    const marginEngineAddress = rootSwapEvent.marginEngineAddress;
    const vammAddress = rootSwapEvent.vammAddress;
    // doesn't apply to passive swaps (since fee income of lps is accounted for separately)
    const feePaidToLps = 0;

    const passiveSwapEvent = {
        eventId, chainId, vammAddress, ownerAddress, 
        tickLower, tickUpper, notionalLocked, fixedRateLocked,
        feePaidToLps, rateOracle, underlyingToken, marginEngineAddress
    };

    
   return passiveSwapEvent; 

}