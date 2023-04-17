import { BigQueryPositionRow } from '../../big-query-support';
import { secondsToBqDate } from '../../big-query-support/utils';
import { getTimestampInSeconds, POSITIONS_TABLE_ID } from '../../common';
import { MintOrBurnEventInfo } from '../../common/event-parsers';

export const gPositionUpdateQueryMintBurn = (
  existingPosition: BigQueryPositionRow,
  eventInfo: MintOrBurnEventInfo,
): string => {
  const rowLastUpdatedTimestamp = getTimestampInSeconds();
  const notionalLiquidityProvided =
    existingPosition.notionalLiquidityProvided + eventInfo.notionalDelta;

  const query = `
    UPDATE \`${POSITIONS_TABLE_ID}\`
        SET notionalLiquidityProvided=${notionalLiquidityProvided},
        rowLastUpdatedTimestamp=\'${secondsToBqDate(rowLastUpdatedTimestamp)}\'
    WHERE chainId=${existingPosition.chainId} AND
        vammAddress=\"${existingPosition.vammAddress}\" AND 
        ownerAddress=\"${existingPosition.ownerAddress}\" AND
        tickLower=${existingPosition.tickLower} AND 
        tickUpper=${existingPosition.tickUpper};
    `;

  return query;
};
