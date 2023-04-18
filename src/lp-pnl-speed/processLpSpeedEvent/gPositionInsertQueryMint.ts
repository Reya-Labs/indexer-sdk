import { secondsToBqDate } from '../../big-query-support/utils';
import { getTimestampInSeconds, POSITIONS_TABLE_ID } from '../../common';
import { MintOrBurnEventInfo } from '../../common/event-parsers';

export const gPositionInsertQueryMint = (
  eventInfo: MintOrBurnEventInfo,
  currentTick: number,
): string => {
  if (eventInfo.type === 'burn') {
    throw Error('Cannot process burn before position is initialized');
  }

  const rowLastUpdatedTimestamp = getTimestampInSeconds();

  // todo: add typings
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
