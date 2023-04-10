

import { SwapEventInfo } from '../../common/swaps/parseSwapEvent';
import { BigQueryPositionRow } from '../../big-query-support';
import { getOnChainFixedAndVariableTokenBalances } from './getOnChainFixedAndVariableTokenBalances';
import { generatePassiveSwapEvent } from './generatePassiveSwapEvent';

export type GeneratePassiveSwapEventsArgs = {

    existingLpPositionRows: BigQueryPositionRow[],
    currentTimestamp: number

}

export type GeneratePassiveSwapEventsReturn = {
    passiveSwapEvents: SwapEventInfo[], 
    affectedLps: BigQueryPositionRow[]
}

export const generatePassiveSwapEvents = async ({existingLpPositionRows, currentTimestamp}: GeneratePassiveSwapEventsArgs): GeneratePassiveSwapEventsReturn => {

    let passiveSwapEvents: SwapEventInfo[] = [];
    let affectedLps: BigQueryPositionRow[] = [];

    for (let i=0; i < existingLpPositionRows.length; i++) { 

        const positionRow: BigQueryPositionRow  = existingLpPositionRows[i];
        const lastUpdatedTimestampLP: number = positionRow.lastUpdatedTimestamp;
        const isInFuture: boolean = lastUpdatedTimestampLP > currentTimestamp;

        if (!isInFuture) { 

            const cachedVariableTokenBalance: number = positionRow.variableTokenBalance;
            const cachedFixedTokenBalance: number = positionRow.fixedTokenBalance;
            const vammAddress: string = positionRow.vammAddress;
            const ownerAddress: string = positionRow.ownerAddress;
            const tickLower: number = positionRow.tickLower; 
            const tickUpper: number = positionRow.tickUpper;

            // todo: get back once implementation is ready
            const {onChainVariableTokenBalance, onChainFixedTokenBalance} = await getOnChainFixedAndVariableTokenBalances();

            const cachedAndOnChainVariableTokenBalanceMatch = cachedVariableTokenBalance === onChainVariableTokenBalance;    
            const cachedAndOnChainFixedTokenBalanceMatch = cachedFixedTokenBalance === onChainFixedTokenBalance;

            if (cachedAndOnChainVariableTokenBalanceMatch && cachedAndOnChainFixedTokenBalanceMatch) {
                console.log(`Variable and Fixed Token Balances match, no need for passive swap`); 
            } else {
                // todo: get back once implementation is done 
                const passiveSwap: SwapEventInfo = generatePassiveSwapEvent();
                passiveSwapEvents.push(passiveSwap);
                affectedLps.push(positionRow); 
            }

        } else {
            console.log(`this lp position was initialized in the future relative to event`);
        }


    }
    
    
    return {passiveSwapEvents, affectedLps};

}