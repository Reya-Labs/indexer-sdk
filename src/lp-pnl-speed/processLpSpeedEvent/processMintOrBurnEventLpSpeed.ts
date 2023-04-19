import { BigQuery } from '@google-cloud/bigquery';

import { BigQueryPositionRow, pullExistingPositionRow } from '../../big-query-support';
import { secondsToBqDate } from '../../big-query-support/utils';
import { getTimestampInSeconds,POSITIONS_TABLE_ID } from '../../common';
import { MintOrBurnEventInfo } from '../../common/event-parsers';

const getPositionUpdateQuery = (
  existingPosition: BigQueryPositionRow,
  eventInfo: MintOrBurnEventInfo,
): string => {
  const rowLastUpdatedTimestamp = getTimestampInSeconds();
  const notionalLiquidityProvided =
    existingPosition.notionalLiquidityProvided + eventInfo.notionalDelta;

  const query = `
    UPDATE \`${POSITIONS_TABLE_ID}\`
        SET notionalLiquidityProvided=${notionalLiquidityProvided},
        rowLastUpdatedTimestamp=\'${secondsToBqDate(rowLastUpdatedTimestamp)}\',
        lastUpdatedBlockNumber=${eventInfo.eventBlockNumber}

    WHERE 
        chainId=${existingPosition.chainId} AND
        vammAddress=\"${existingPosition.vammAddress}\" AND 
        ownerAddress=\"${existingPosition.ownerAddress}\" AND
        tickLower=${existingPosition.tickLower} AND 
        tickUpper=${existingPosition.tickUpper};
    `;

  return query;
};

const getPositionInsertQuery = (
  eventInfo: MintOrBurnEventInfo,
  currentTick: number,
): string => {
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
    ${eventInfo.eventBlockNumber},
    ${eventInfo.notionalDelta},                
    ${0},
    ${0},
    ${eventInfo.amm.rateOracle.protocolId},
    \'${secondsToBqDate(rowLastUpdatedTimestamp)}\',
    ${0},
    ${0},
    ${eventInfo.eventBlockNumber},
    \'${eventInfo.amm.rateOracle.protocol}\',
    \'${eventInfo.amm.underlyingToken.name}\',
    ${eventInfo.chainId},
    ${0},
    ${0},
    ${0},
    ${eventInfo.liquidityDelta},
    ${currentTick}
  `;

  const query = `INSERT INTO \`${POSITIONS_TABLE_ID}\` VALUES(${row})`;

  return query;
};

export const processMintOrBurnEventLpSpeed = async (
  bigQuery: BigQuery,
  eventInfo: MintOrBurnEventInfo,
  currentTick: number,
): Promise<void> => {
  const existingPosition: BigQueryPositionRow | null = await pullExistingPositionRow(
    bigQuery,
    eventInfo.chainId,
    eventInfo.vammAddress,
    eventInfo.ownerAddress,
    eventInfo.tickLower,
    eventInfo.tickUpper,
  );

  const query = (existingPosition) 
    ? getPositionUpdateQuery(existingPosition, eventInfo) 
    : getPositionInsertQuery(eventInfo, currentTick);

  const options = {
    query: query,
    timeoutMs: 100000,
    useLegacySql: false,
  };

  await bigQuery.query(options);
};
