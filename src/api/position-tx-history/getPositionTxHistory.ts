import { getPositions as getRawPositions } from '@voltz-protocol/subgraph-data';

import { getSubgraphURL } from "../subgraph/getSubgraphURL";
import { Transaction } from "./types";

export const getPositionTxHistory = async (chainId: number, vammAddress: string, ownerAddress: string, tickLower: number, tickUpper: number): Promise<Transaction[]> => {
    const now = Date.now().valueOf();

    const positions = (await getRawPositions(
        getSubgraphURL(chainId),
        now,
        {
            owners: [ownerAddress],
            ammIDs: [vammAddress],
        },
    )).filter((pos) => pos.tickLower === tickLower && pos.tickUpper === tickUpper);

    if (positions.length === 0) {
        return [];
    }

    return [];
}