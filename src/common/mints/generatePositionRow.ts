import { AMM } from '@voltz-protocol/v1-sdk';
import { BigQueryPositionRow } from '../../big-query-support';
import { getTimestampInSeconds } from '..';
import { MintEventInfo } from './parseMintEvent';

export const generatePositionRow = async (
  amm: AMM,
  eventInfo: MintEventInfo,
  eventTimestamp: number,
  existingPosition: BigQueryPositionRow | null,
): Promise<BigQueryPositionRow | null> => {
  const rowLastUpdatedTimestamp = getTimestampInSeconds();

  if (existingPosition) {
    // todo: in the future can handle this as well
    return null;
  } else { 

    // todo: add empty entries
    return {
        marginEngineAddress: amm.marginEngineAddress.toLowerCase(),
        vammAddress: eventInfo.vammAddress,
        ownerAddress: eventInfo.ownerAddress,
        tickLower: eventInfo.tickLower,
        tickUpper: eventInfo.tickUpper,
        realizedPnLFromSwaps: 0,
        realizedPnLFromFeesPaid: 0,
        netNotionalLocked: 0,
        netFixedRateLocked: 0,
        lastUpdatedTimestamp: eventTimestamp,
        notionalLiquidityProvided: eventInfo.notionalLiquidityProvided,
        realizedPnLFromFeesCollected: 0,
        netMarginDeposited: 0,
        rateOracleIndex: amm.rateOracle.protocolId,
        rowLastUpdatedTimestamp: rowLastUpdatedTimestamp,
        fixedTokenBalance: 0,
        variableTokenBalance: 0,
        positionInitializationTimestamp: eventTimestamp,
        rateOracle: amm.rateOracle.id,
        underlyingToken: amm.underlyingToken.id,
        chainId: eventInfo.chainId,
    };

  }

};
