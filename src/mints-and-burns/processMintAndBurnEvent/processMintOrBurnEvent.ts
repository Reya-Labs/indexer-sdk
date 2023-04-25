import { pullExistingMintOrBurnRow } from '../../big-query-support/mints-and-burns-table/pull-data/pullExistingMintOrBurnRow';
import { insertNewMintOrBurn } from '../../big-query-support/mints-and-burns-table/push-data/insertNewMintOrBurn';
import { MintOrBurnEventInfo } from '../../common/event-parsers/types';

export const processMintOrBurnEvent = async (event: MintOrBurnEventInfo): Promise<void> => {
  const existingMintOrBurnEvent = await pullExistingMintOrBurnRow(event.eventId);

  if (existingMintOrBurnEvent) {
    return;
  }

  await insertNewMintOrBurn(event);
};
