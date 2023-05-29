/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import {
    getPositions as getRawPositions
} from '@voltz-protocol/subgraph-data';

import { generateMarginEngineContract } from '../../common/contract-services/generateMarginEngineContract';
import { descale } from '../../common/descale';
import { getProvider } from '../../common/provider/getProvider';
import { getTokensFromLiquidity } from '../../common/services/getTokensFromLiquidity';
import { tickToFixedRate } from '../../common/services/tickConversions';
import { getPositionPnL } from '../position-pnl/getPositionPnL';
import { getSubgraphURL } from "../subgraph/getSubgraphURL";
import { getRangeHealthFactor } from './getRangeHealthFactor';
import { HealthFactorStatus, PortfolioPosition } from "./types";

export const getPortfolioPositions = async (chainIds: number[], ownerAddress: string): Promise<PortfolioPosition[]> => {
    const now = Date.now().valueOf();

    for (const chainId of chainIds) {
        const positions = await getRawPositions(
            getSubgraphURL(chainId),
            now,
            {
                owners: [ownerAddress],
            },
        );
    
        const provider = getProvider(chainId);

        await Promise.allSettled(positions.map(async (pos): Promise<PortfolioPosition> => {
            const vammAddress = pos.amm.id;
            const marginEngineAddress = pos.amm.marginEngineId;
            const tokenDecimals = pos.amm.tokenDecimals;

            const tickLower = pos.tickLower;
            const tickUpper = pos.tickUpper;

            let data: Omit<PortfolioPosition, "status"> = {
                chainId,
                vammAddress,
                ownerAddress,
                tickLower,
                tickUpper,
                notionalProvided: 0,
                notional: 0,
                margin: 0,
                accumulatedFees: 0,
                realizedPnLFromSwaps: 0,
                realizedPnLFromFeesPaid: 0,
                realizedPnLFromFeesCollected: 0,
                unrealizedPnLFromSwaps: 0,
                healthFactor: HealthFactorStatus.HEALTHY,
                inRangeHealthFactor: HealthFactorStatus.HEALTHY,
            };

            if (pos.isSettled) {
                // Position is settled

                return {
                    ...data,
                    status: 'settled',
                };
            }

            const marginEngine = generateMarginEngineContract(marginEngineAddress, provider);

            // Get fresh information about the position
            const freshInfo = await marginEngine.callStatic.getPosition(ownerAddress, tickLower, tickUpper);

            const descaler = descale(tokenDecimals);

            const liquidity = descaler(freshInfo._liquidity);
            const { absVariableTokenDelta: notionalProvided } = getTokensFromLiquidity(liquidity, tickLower, tickUpper);
            data.notionalProvided = notionalProvided;

            data.notional = descaler(freshInfo.variableTokenBalance);
            data.accumulatedFees = descaler(freshInfo.fees);
            data.margin = descaler(freshInfo.margin) - data.accumulatedFees;

            if (pos.amm.termEndTimestampInMS <= now) {
                // Position is matured

                return {
                    ...data,
                    status: 'matured',
                };
            }

            // Get information about position PnL
            const positionPnL = await getPositionPnL(chainId, vammAddress, ownerAddress, tickLower, tickUpper);
            data = {
                ...data,
                ...positionPnL,
            };
            
            // Get health factor
            data.healthFactor = HealthFactorStatus.NOT_FOUND;

            try {
                const liquidationThreshold = descaler(await marginEngine.callStatic.getPositionMarginRequirement(
                    ownerAddress,
                    tickLower,
                    tickUpper,
                    true,
                ));

                const safetyThreshold = descaler(await marginEngine.callStatic.getPositionMarginRequirement(
                    ownerAddress,
                    tickLower,
                    tickUpper,
                    false,
                ));

                if (data.margin + data.accumulatedFees < liquidationThreshold) {
                    data.healthFactor = HealthFactorStatus.DANGER;
                }
                else if (data.margin + data.accumulatedFees < safetyThreshold) {
                    data.healthFactor = HealthFactorStatus.WARNING;
                }
                else {
                    data.healthFactor = HealthFactorStatus.HEALTHY;
                }
            } catch (_) {}
            
            const fixedLow = tickToFixedRate(tickUpper);
            const fixedHigh = tickToFixedRate(tickUpper);
            const poolAPR = 1; // todo: implement
            data.inRangeHealthFactor = getRangeHealthFactor(fixedLow, fixedHigh, poolAPR);

            return {
                ...data,
                status: 'active',
            }
        }))
    }

    return [];
}