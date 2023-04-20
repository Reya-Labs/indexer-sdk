import { pullExistingPositionRow } from '../../big-query-support/pull-data/pullExistingPositionRow';
import { BigQueryPositionRow } from '../../big-query-support/pull-data/types';
import { secondsToBqDate } from '../../big-query-support/utils';
import { POSITIONS_TABLE_ID } from '../../common/constants';
import { MintOrBurnEventInfo } from '../../common/event-parsers/types';
import { getTimestampInSeconds } from '../../common/utils';
import { getBigQuery } from '../../global';

const getPositionUpdateQuery = (
  eventInfo: MintOrBurnEventInfo,
  existingPosition: BigQueryPositionRow,
): string => {
  const rowLastUpdatedTimestamp = getTimestampInSeconds();

  const notionalLiquidityProvided =
    existingPosition.notionalLiquidityProvided + eventInfo.notionalDelta;

  const liquidity = existingPosition.liquidity + eventInfo.liquidityDelta;

  const query = `
    UPDATE \`${POSITIONS_TABLE_ID}\`
        SET lastUpdatedBlockNumber=${eventInfo.blockNumber},
            notionalLiquidityProvided=${notionalLiquidityProvided},
            rowLastUpdatedTimestamp=\'${secondsToBqDate(rowLastUpdatedTimestamp)}\',
            liquidity=${liquidity}
    WHERE 
        chainId=${existingPosition.chainId} AND
        vammAddress=\"${existingPosition.vammAddress}\" AND 
        ownerAddress=\"${existingPosition.ownerAddress}\" AND
        tickLower=${existingPosition.tickLower} AND 
        tickUpper=${existingPosition.tickUpper};
    `;

  return query;
};

const getPositionInsertQuery = (eventInfo: MintOrBurnEventInfo): string => {
  const rowLastUpdatedTimestamp = getTimestampInSeconds();

  const row = `
    \"${eventInfo.marginEngineAddress}\",
    \"${eventInfo.vammAddress}\",
    \"${eventInfo.ownerAddress}\",
    ${eventInfo.tickLower},
    ${eventInfo.tickUpper},
    ${0},
    ${0},
    ${0},
    ${0},
    ${eventInfo.blockNumber},
    ${eventInfo.notionalDelta},                
    ${0},
    ${0},
    ${eventInfo.amm.rateOracle.protocolId},
    \'${secondsToBqDate(rowLastUpdatedTimestamp)}\',
    ${0},
    ${0},
    ${eventInfo.blockNumber},
    \'${eventInfo.amm.rateOracle.protocol}\',
    \'${eventInfo.amm.underlyingToken.name}\',
    ${eventInfo.chainId},
    ${0},
    ${0},
    ${0},
    ${eventInfo.liquidityDelta}
  `;

  const query = `INSERT INTO \`${POSITIONS_TABLE_ID}\` VALUES(${row})`;

  return query;
};

export const processMintOrBurnEventLpSpeed = async (
  eventInfo: MintOrBurnEventInfo,
): Promise<void> => {
  const bigQuery = getBigQuery();

  console.log(`Operating on ${eventInfo.ownerAddress}`);

  const existingPosition: BigQueryPositionRow | null = await pullExistingPositionRow(
    eventInfo.chainId,
    eventInfo.vammAddress,
    eventInfo.ownerAddress,
    eventInfo.tickLower,
    eventInfo.tickUpper,
  );

  const query = existingPosition
    ? getPositionUpdateQuery(eventInfo, existingPosition)
    : getPositionInsertQuery(eventInfo);

  const options = {
    query: query,
    timeoutMs: 100000,
    useLegacySql: false,
  };

  await bigQuery.query(options);
};
