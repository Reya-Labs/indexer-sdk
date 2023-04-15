import { secondsToBqDate } from "../../big-query-support/utils";
import { POSITIONS_TABLE_ID, getTimestampInSeconds } from "../../common";
import { MintOrBurnEventInfo } from "../../common/event-parsers";

export const gPositionInsertQueryMint = (
    eventInfo: MintOrBurnEventInfo
): string => {

    if (eventInfo.type === 'burn') {
        throw Error('Cannot process burn before position is initialized');
    }

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
    \'${secondsToBqDate(eventInfo.eventTimestamp)}\',
    ${eventInfo.notionalDelta},                
    ${0},
    ${0},
    ${eventInfo.amm.rateOracle.protocolId},
    \'${secondsToBqDate(rowLastUpdatedTimestamp)}\',
    ${0},
    ${0},
    \'${secondsToBqDate(eventInfo.eventTimestamp)}\',
    \'${eventInfo.amm.rateOracle.protocol}\',
    \'${eventInfo.amm.underlyingToken.name}\',
    ${eventInfo.chainId},
    ${0},
    ${0},
    ${0}
  `;

    const query = `INSERT INTO \`${POSITIONS_TABLE_ID}\` VALUES(${row})`
    
    return query;
}