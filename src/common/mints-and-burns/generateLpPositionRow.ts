import { BigQueryPositionRow } from '../../big-query-support';
import { getTimestampInSeconds } from '..';
import { MintOrBurnEventInfo } from '../event-parsers/parseMintOrBurnEvent';

export const generateLpPositionRow = (eventInfo: MintOrBurnEventInfo): BigQueryPositionRow => {
  const rowLastUpdatedTimestamp = getTimestampInSeconds();

  return {
    marginEngineAddress: eventInfo.amm.marginEngineAddress.toLowerCase(),
    vammAddress: eventInfo.vammAddress,
    ownerAddress: eventInfo.ownerAddress,
    tickLower: eventInfo.tickLower,
    tickUpper: eventInfo.tickUpper,
    realizedPnLFromSwaps: 0,
    realizedPnLFromFeesPaid: 0,
    netNotionalLocked: 0,
    netFixedRateLocked: 0,
    lastUpdatedBlockNumber: eventInfo.eventBlockNumber,
    notionalLiquidityProvided: eventInfo.notionalDelta,
    realizedPnLFromFeesCollected: 0,
    netMarginDeposited: 0,
    rateOracleIndex: eventInfo.amm.rateOracle.protocolId,
    rowLastUpdatedTimestamp: rowLastUpdatedTimestamp,
    fixedTokenBalance: 0,
    variableTokenBalance: 0,
    positionInitializationBlockNumber: eventInfo.eventBlockNumber,
    rateOracle: eventInfo.amm.rateOracle.id,
    underlyingToken: eventInfo.amm.underlyingToken.name,
    chainId: eventInfo.chainId,
    cashflowLiFactor: 0,
    cashflowTimeFactor: 0,
    cashflowFreeTerm: 0,
    tickPrevious: 0, // not relevant for this processing
    liquidity: 0, // not relevant for this processing
  };
};
