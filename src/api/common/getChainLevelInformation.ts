import { BigQuery } from "@google-cloud/bigquery";
import { pullRows } from "../../big-query-support/pullRows";
import { dollarAggregate } from "./dollarAggregate";

export type GetChainLevelInformationArgs = {
    chainId: number;
    activeSwapsTableId: string;
    mintsAndBurnsTableId: string;
    bigQuery: BigQuery;
    geckoKey: string;
}

export type GetChainLevelInformationReturn = {
    volume30Day: number | null,
    totalLiquidity: number | null
}

/**
 Get chain level information
 */
 export const getChainLevelInformation = async ({
    chainId,
    activeSwapsTableId,
    mintsAndBurnsTableId,
    bigQuery,
    geckoKey
 }: GetChainLevelInformationArgs): Promise<GetChainLevelInformationReturn> => {

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