import { BigQuery } from "@google-cloud/bigquery";
import { pullRows } from "../../big-query-support/pullRows";



export type GetChainLevelInformationArgs = {
    chainId: number;
    activeSwapsTableId: string;
    mintsAndBurnsTableId: string;
    bigQuery: BigQuery;
    geckoKey: string;
}

/**
 Get chain level information
 */
 export async function getChainLevelInformation({
    chainId,
    activeSwapsTableId,
    mintsAndBurnsTableId,
    bigQuery,
    geckoKey
 }: GetChainLevelInformationArgs) {

    // queries

    const volumeQuery = `
        SELECT underlyingToken, sum(abs(notionalLocked)) as amount
        FROM \`${activeSwapsTableId}\`
        
        WHERE (eventTimestamp > TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 30 DAY)) 
        AND (chainId=${chainId})
        
        GROUP BY underlyingToken
    `;

    const liquidityQuery = `
        SELECT underlyingToken, sum(notionalDelta) as amount
        FROM \`${mintsAndBurnsTableId}\`
        
        WHERE chainId=${chainId}
        
        GROUP BY underlyingToken
    `;

    const volumeByUnderlyingRows = await pullRows(volumeQuery, bigQuery);
    const liquidityByUnderlyingRows = await pullRows(liquidityQuery, bigQuery);

    let volume30DayInDollars = null;
    let totalLiquidityInDollars = null;

    if (volumeByUnderlyingRows !== null) { 
        volume30DayInDollars = await dollarAggregate(volumeByUnderlyingRows, geckoKey);
    }

    if (liquidityByUnderlyingRows !== null) { 
        totalLiquidityInDollars = await dollarAggregate(liquidityByUnderlyingRows, geckoKey);
    }

    return { 
        volume30Day: volume30DayInDollars,
        totalLiquidity: totalLiquidityInDollars
    };

}