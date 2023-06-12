import { MintOrBurnEventInfo } from '../../../common/event-parsers/types';
import { getTimestampInSeconds } from '../../../common/utils';
import { sendQueriesInBatches } from '../../sendQueriesInBatches';
import { getTableFullID, secondsToBqDate } from '../../utils';

export const insertNewMintOrBurns = async (
  processName: string,
  events: MintOrBurnEventInfo[],
): Promise<void> => {
  const updates: string[] = [];
  const tableId = getTableFullID('mints_and_burns');
  const currentTimestamp = getTimestampInSeconds();

  for (const event of events) {
    const eventTimestamp = (await event.getBlock()).timestamp;

    const rawMintOrBurnRow = `
    \"${event.eventId}\",
    \"${event.vammAddress}\",
    \"${event.ownerAddress}\",
    ${event.tickLower}, 
    ${event.tickUpper}, 
    ${event.notionalDelta}, 
    ${event.blockNumber}, 
    \'${secondsToBqDate(eventTimestamp)}\', 
    \'${secondsToBqDate(currentTimestamp)}\',
    \'${event.rateOracle}\',
    \'${event.underlyingToken}\',
    \'${event.marginEngineAddress}\',
    ${event.chainId}
  `;

    updates.push(`INSERT INTO \`${tableId}\` VALUES (${rawMintOrBurnRow});`);
  }

  await sendQueriesInBatches(processName, updates);
};
