import { secondsToBqDate } from "../../big-query-support/utils";
import { getTimestampInSeconds } from "../../common";
import { MintOrBurnEventInfo } from "../../common/event-parsers";

export const gPositionInsertQueryMint = (
    eventInfo: MintOrBurnEventInfo
): string => {

    if (eventInfo.type === 'burn') {
        throw Error('Cannot process burn before position is initialized');
    }

    const rowLastUpdatedTimestamp = getTimestampInSeconds();

    const query = `
    \"${eventInfo.marginEngineAddress}\",
    \"${eventInfo.vammAddress}\",
    \"${eventInfo.ownerAddress}\",
    ${eventInfo.tickLower},
    ${eventInfo.tickUpper},
    ${0},
    ${0},
    ${0},
    ${0},
    \'${secondsToBqDate(eventInfo.timestamp)}\',
    ${eventInfo.notionalDelta},                
    ${0},
    ${0},
    ${eventInfo.amm.rateOracle.protocolId},
    \'${secondsToBqDate(rowLastUpdatedTimestamp)}\',
    ${0},
    ${0},
    \'${secondsToBqDate(eventInfo.timestamp)}\',
    \'${eventInfo.amm.rateOracle.protocol}\',
    \'${eventInfo.amm.underlyingToken.name}\',
    ${eventInfo.chainId},
    ${0},
    ${0},
    ${0}
  `;
    

    return query;
}