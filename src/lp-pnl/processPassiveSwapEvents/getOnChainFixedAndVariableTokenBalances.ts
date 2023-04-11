import { ethers } from 'ethers';
import { generateMarginEngineContract } from '../../common/generateMarginEngineContract';

export type GetOnChainFixedAndVariableTokenBalancesArgs = {
    marginEngineAddress: string,
    ownerAddress: string,
    tickLower: number,
    tickUpper: number,
    tokenDecimals: number,
    blockNumber: number,
    provider: ethers.providers.Provider
}

export type GetOnChainFixedAndVariableTokenBalancesReturn = {
    onChainVariableTokenBalance: number,
    onChainFixedTokenBalance: number
}


export const getOnChainFixedAndVariableTokenBalances = async ({
    marginEngineAddress,
    ownerAddress,
    tickLower,
    tickUpper,
    tokenDecimals,
    blockNumber, 
    provider
}: GetOnChainFixedAndVariableTokenBalancesArgs): Promise<GetOnChainFixedAndVariableTokenBalancesReturn> => {

    const marginEngineContract = generateMarginEngineContract(marginEngineAddress, provider);

    // todo: how do we type the position object? 
    const position = await marginEngineContract.callStatic.getPosition(
        ownerAddress, 
        tickLower,
        tickUpper, 
        { blockTag: blockNumber }
    ); 

    if (position === null || position === undefined) {
        throw new Error(`Could not fetch the on chain position to bring fixed and variable token balances`);
    }

    // not sure if .toString() is redundunt
    const onChainFixedTokenBalance = Number(ethers.utils.formatUnits(position.fixedTokenBalance.toString(), tokenDecimals));
    const onChainVariableTokenBalance = Number(ethers.utils.formatUnits(position.fixedTokenBalance.toString(), tokenDecimals));

    return {onChainVariableTokenBalance, onChainFixedTokenBalance};

}