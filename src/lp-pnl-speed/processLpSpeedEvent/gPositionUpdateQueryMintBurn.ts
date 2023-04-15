import { BigQueryPositionRow } from "../../big-query-support";
import { secondsToBqDate } from "../../big-query-support/utils";
import { getTimestampInSeconds } from "../../common";
import { MintOrBurnEventInfo } from "../../common/event-parsers";

export const gPositionUpdateQueryMintBurn = (
    existingPosition: BigQueryPositionRow,
    eventInfo: MintOrBurnEventInfo
): string => {


    const rowLastUpdatedTimestamp = getTimestampInSeconds();    

    



    return '';
}