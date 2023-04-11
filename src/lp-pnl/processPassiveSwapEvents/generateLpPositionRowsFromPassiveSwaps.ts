

import { SwapEventInfo } from '../../common/swaps/parseSwapEvent';
import { BigQueryPositionRow } from '../../big-query-support';
import { BigQuery } from '@google-cloud/bigquery';

export type GenerateLpPositionRowsFromPassiveSwapsArgs = {

    passiveSwapEvents: SwapEventInfo[],
    affectedLps: BigQueryPositionRow[],
    bigQuery: BigQuery,
    chainId: number

}


export const generateLpPositionRowsFromPassiveSwaps = async ({
    passiveSwapEvents,
    affectedLps,
    bigQuery,
    chainId
}: GenerateLpPositionRowsFromPassiveSwapsArgs): Promise<BigQueryPositionRow[]> => {

    if ((passiveSwapEvents.length !== affectedLps.length) || (passiveSwapEvents.length===0)) {
        return [];
    }

    let positionRows: BigQueryPositionRow[] = [];
    const numberOfSwaps = passiveSwapEvents.length;

    for (let i=0; i < numberOfSwaps; i++) { 
        const passiveSwapEvent: SwapEventInfo = passiveSwapEvents[i]; 
        const affectedLp: BigQueryPositionRow = affectedLps[i];
        const positionRow: BigQueryPositionRow = await generateLpPositionRowFromPassiveSwap(
            {passiveSwapEvent, affectedLp, chainId, bigQuery}
        );
        positionRows.push(positionRow);
    }
    
    return positionRows;
   
}