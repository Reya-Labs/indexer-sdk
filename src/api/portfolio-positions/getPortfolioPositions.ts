/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import {
    getPositions as getRawPositions,
    Position as RawPosition
} from '@voltz-protocol/subgraph-data';

import { SECONDS_IN_YEAR } from '../../common/constants';
import { generateMarginEngineContract } from '../../common/contract-services/generateMarginEngineContract';
import { getCurrentTick } from '../../common/contract-services/getCurrentTick';
import { descale } from '../../common/descale';
import { getProvider } from '../../common/provider/getProvider';
import { getTokensFromLiquidity } from '../../common/services/getTokensFromLiquidity';
import { getVariableFactor } from '../../common/services/getVariableFactor';
import { tickToFixedRate } from '../../common/services/tickConversions';
import { getTokenPriceInUSD } from '../get-token-price/getTokenPriceInUSD';
import { getPositionPnL } from '../position-pnl/getPositionPnL';
import { getSubgraphURL } from "../subgraph/getSubgraphURL";
import { PortfolioPosition, PortfolioPositionAMM } from "./types";

const isBorrowingProtocol = (protocolId: number) => {
    return protocolId === 6 || protocolId === 5 || protocolId === 9;
}

export const getPortfolioPositions = async (chainIds: number[], ownerAddress: string): Promise<PortfolioPosition[]> => {
    const now = Date.now().valueOf();

    const allPositions: (RawPosition & { chainId: number })[] = [];
    for (const chainId of chainIds) {
        const positions = await getRawPositions(
            getSubgraphURL(chainId),
            now,
            {
                owners: [ownerAddress],
            },
        );

        allPositions.push(...positions.map((p) => ({
            ...p,
            chainId
        })));
    }

    const responses = await Promise.allSettled(allPositions.map(async (pos): Promise<PortfolioPosition> => {
        const chainId = pos.chainId;
        const vammAddress = pos.amm.id;
        const marginEngineAddress = pos.amm.marginEngineId;
        const tokenDecimals = pos.amm.tokenDecimals;
        const tokenName = pos.amm.tokenName;
        const descaler = descale(tokenDecimals);

        const tickLower = pos.tickLower;
        const tickUpper = pos.tickUpper;

        const fixLow = tickToFixedRate(tickUpper);
        const fixHigh = tickToFixedRate(tickUpper);

        const positionId = `${chainId}_${vammAddress.toLowerCase()}_${ownerAddress.toLowerCase()}_${tickLower}_${tickUpper}`;
        const positionType = (pos.positionType === 3) ? 'LP' : (pos.positionType === 2) ? 'Variable' : 'Fixed';

        const provider = getProvider(chainId);
        const tokenPriceInUSD = await getTokenPriceInUSD(tokenName);

        const isBorrowing = isBorrowingProtocol(pos.amm.protocolId);
        const market = 'Aave V2';

        const amm: PortfolioPositionAMM = {
            id: vammAddress,
            chainId,

            isBorrowing,
            market,

            rateOracle: {
                protocolId: pos.amm.protocolId
            },

            underlyingToken: {
                name: tokenName.toLowerCase() as 'eth' | 'usdc' | 'usdt' | 'dai',
            },

            termStartTimestampInMS: pos.amm.termStartTimestampInMS,
            termEndTimestampInMS: pos.amm.termEndTimestampInMS,
        };

        // Check if position is settled and return minimum data
        if (pos.isSettled) {
            return {
                id: positionId,
                type: positionType,
                ownerAddress,
                tickLower,
                tickUpper,
                fixLow,
                fixHigh,
                notionalProvided: 0,
                notionalProvidedUSD: 0,
                notionalTraded: 0,
                notionalTradedUSD: 0,
                notional: 0,
                notionalUSD: 0,
                margin: 0,
                marginUSD: 0,
                status: {
                    health: 'healthy',
                    variant: 'settled',
                    currentFixed: 0,
                    receiving: 0,
                    paying: 0,
                },
                unrealizedPNL: 0,
                unrealizedPNLUSD: 0,
                realizedPNLFees: 0,
                realizedPNLFeesUSD: 0,
                realizedPNLCashflow: 0,
                realizedPNLCashflowUSD: 0,

                realizedPNLTotal: 0,
                realizedPNLTotalUSD: 0,
            
                amm,
            }
        }

        const marginEngine = generateMarginEngineContract(marginEngineAddress, provider);

        // Get fresh information about the position
        const freshInfo = await marginEngine.callStatic.getPosition(ownerAddress, tickLower, tickUpper);

        const liquidity = descaler(freshInfo._liquidity);
        const { absVariableTokenDelta: notionalProvided } = getTokensFromLiquidity(liquidity, tickLower, tickUpper);
        const notionalProvidedUSD = notionalProvided * tokenPriceInUSD;

        const variableTokenBalance = descaler(freshInfo.variableTokenBalance);

        const notionalTraded = Math.abs(variableTokenBalance);
        const notionalTradedUSD = notionalTraded * tokenPriceInUSD;

        const fixedTokenBalance = descaler(freshInfo.fixedTokenBalance);

        const notional = (positionType === 'LP') ? notionalProvided : notionalTraded;
        const notionalUSD = notional * tokenPriceInUSD;
        
        const accumulatedFees = descaler(freshInfo.accumulatedFees);
        const accumulatedFeesUSD = accumulatedFees * tokenPriceInUSD;

        const margin = descaler(freshInfo.margin) - accumulatedFees;
        const marginUSD = margin * tokenPriceInUSD;

        if (pos.amm.termEndTimestampInMS <= now) {
            // Position is matured

            let settlementCashflow = 0;
            try {
                const variableFactor = await getVariableFactor(chainId, pos.amm.rateOracleId)(pos.amm.termStartTimestampInMS, pos.amm.termEndTimestampInMS);
                const fixedFactor =
                    (pos.amm.termEndTimestampInMS - pos.amm.termStartTimestampInMS) /
                    SECONDS_IN_YEAR /
                    1000;

                settlementCashflow = fixedTokenBalance * fixedFactor * 0.01 + variableTokenBalance * variableFactor;
            } catch (_) {
                console.log(`Failed to fetch settlement cashflow.`);
            }
            
            const realizedPNLCashflow = settlementCashflow;
            const realizedPNLCashflowUSD = realizedPNLCashflow * tokenPriceInUSD;

            return {
                id: positionId,
                type: positionType,
                ownerAddress,
                tickLower,
                tickUpper,
                fixLow,
                fixHigh,
                notionalProvided,
                notionalProvidedUSD,
                notionalTraded,
                notionalTradedUSD,
                notional,
                notionalUSD,
                margin,
                marginUSD,
                status: {
                    health: 'healthy',
                    variant: 'matured',
                    currentFixed: 0,
                    receiving: 0,
                    paying: 0,
                },
                unrealizedPNL: 0,
                unrealizedPNLUSD: 0,
                realizedPNLFees: accumulatedFees,
                realizedPNLFeesUSD: accumulatedFeesUSD,
                realizedPNLCashflow,
                realizedPNLCashflowUSD,

                realizedPNLTotal: accumulatedFees + realizedPNLCashflow,
                realizedPNLTotalUSD: accumulatedFeesUSD + realizedPNLCashflowUSD,
            
                amm,
            }
        }

        // Get information about position PnL
        const positionPnL = await getPositionPnL(chainId, vammAddress, ownerAddress, tickLower, tickUpper);
        const realizedPNLCashflow = positionPnL.realizedPnLFromSwaps;
        const realizedPNLCashflowUSD = realizedPNLCashflow * tokenPriceInUSD; 

        const paidFees = positionPnL.realizedPnLFromFeesPaid;
        const paidFeesUSD = paidFees * tokenPriceInUSD;

        const unrealizedPNL = positionPnL.unrealizedPnLFromSwaps;
        const unrealizedPNLUSD = unrealizedPNL * tokenPriceInUSD;

        const fixedRateLocked = positionPnL.fixedRateLocked;
        const variableRate = 0;

        let health: 'healthy' | 'danger' | 'warning' = 'healthy';

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

            if (margin + accumulatedFees < liquidationThreshold) {
                health = 'danger';
            }
            else if (margin + accumulatedFees < safetyThreshold) {
                health = 'warning'
            }
        } catch (_) { }

        const currentTick = await getCurrentTick(chainId, vammAddress);
        const currentFixed = tickToFixedRate(currentTick);

        const receiving = (positionType === 'LP') ? 0 : (positionType === 'Fixed') ? fixedRateLocked : variableRate;
        const paying = (positionType === 'LP') ? 0 : (positionType === 'Variable') ? variableRate : fixedRateLocked;

        return {
            id: positionId,
            type: positionType,
            ownerAddress,
            tickLower,
            tickUpper,
            fixLow,
            fixHigh,
            notionalProvided,
            notionalProvidedUSD,
            notionalTraded,
            notionalTradedUSD,
            notional,
            notionalUSD,
            margin,
            marginUSD,
            status: {
                health,
                variant: 'active',
                currentFixed,
                receiving,
                paying,
            },
            unrealizedPNL,
            unrealizedPNLUSD,
            realizedPNLFees: accumulatedFees + paidFees,
            realizedPNLFeesUSD: accumulatedFeesUSD + paidFeesUSD,
            realizedPNLCashflow,
            realizedPNLCashflowUSD,

            realizedPNLTotal: accumulatedFees + realizedPNLCashflow + paidFees,
            realizedPNLTotalUSD: accumulatedFeesUSD + realizedPNLCashflowUSD + paidFeesUSD,
        
            amm,
        }
    }));

    return responses
        .map((resp) => {
            if (resp.status === 'fulfilled') {
                return resp.value;
            }
            throw new Error(`Promise rejected with error: ${((resp.reason) as Error).message}`);
        });
}