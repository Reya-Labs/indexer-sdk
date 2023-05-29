import { pullExistingPositionRow } from "../../big-query-support/positions-table/pull-data/pullExistingPositionRow";
import { SECONDS_IN_YEAR } from "../../common/constants";
import { getCurrentTick } from "../../common/contract-services/getCurrentTick";
import { getProvider } from "../../common/provider/getProvider";
import { getLiquidityIndex } from "../../common/services/getLiquidityIndex";
import { tickToFixedRate } from "../../common/services/tickConversions";
import { getBlockAtTimestamp, getTimeInYearsBetweenTimestamps } from "../../common/utils";
import { getAmm } from "../common/getAMM";
import { PositionPnL } from "./types";

export const getPositionPnL = async (chainId: number, vammAddress: string, ownerAddress: string, tickLower: number, tickUpper: number): Promise<PositionPnL>=> {
    const provider = getProvider(chainId);

    const existingPosition = await pullExistingPositionRow(
      chainId,
      vammAddress,
      ownerAddress,
      tickLower,
      tickUpper,
    );

    if (!existingPosition) {
      return {
        realizedPnLFromSwaps: 0,
        realizedPnLFromFeesPaid: 0,
        realizedPnLFromFeesCollected: 0,
        unrealizedPnLFromSwaps: 0,
      };
    }

    const amm = await getAmm(chainId, vammAddress);
    const maturityTimestamp = Math.floor(amm.termEndTimestampInMS / 1000);
    let currentTimestamp = (await provider.getBlock('latest')).timestamp;

    let currentLiquidityIndex = 1;

    if (maturityTimestamp >= currentTimestamp) {
      currentLiquidityIndex = await getLiquidityIndex(chainId, amm.marginEngine);
    } else {
      const blockAtSettlement = await getBlockAtTimestamp(provider, maturityTimestamp);

      currentLiquidityIndex = await getLiquidityIndex(chainId, amm.marginEngine, blockAtSettlement);

      currentTimestamp = maturityTimestamp;
    }

    // realized PnL
    const rPnL =
      existingPosition.cashflowLiFactor * currentLiquidityIndex +
      (existingPosition.cashflowTimeFactor * currentTimestamp) / SECONDS_IN_YEAR +
      existingPosition.cashflowFreeTerm;

    // unrealized PnL
    const currentTick = await getCurrentTick(chainId, vammAddress);
    const currentFixedRate = tickToFixedRate(currentTick);

    const timeInYears = getTimeInYearsBetweenTimestamps(currentTimestamp, maturityTimestamp);

    const uPnL =
      existingPosition.netNotionalLocked *
      (currentFixedRate - existingPosition.netFixedRateLocked) *
      timeInYears;

    return {
      realizedPnLFromSwaps: rPnL,
      realizedPnLFromFeesPaid: existingPosition.realizedPnLFromFeesPaid,
      realizedPnLFromFeesCollected: existingPosition.realizedPnLFromFeesCollected,
      unrealizedPnLFromSwaps: uPnL,
    };
}