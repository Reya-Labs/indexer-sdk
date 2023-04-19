import { BigQuery } from '@google-cloud/bigquery';

import { pullExistingPositionRow } from '../../big-query-support';
import { insertNewMintAndNewPosition } from '../../big-query-support/push-data/insertNewMintAndNewPosition';
import { parseMintOrBurnEvent } from '../../common/event-parsers/parseMintOrBurnEvent';
import { ExtendedEvent } from '../../common/types';

export const processMintEvent = async (bigQuery: BigQuery, event: ExtendedEvent): Promise<void> => {
  const eventInfo = parseMintOrBurnEvent(event);

  const existingPosition = await pullExistingPositionRow(
    bigQuery,
    eventInfo.chainId,
    eventInfo.vammAddress,
    eventInfo.ownerAddress,
    eventInfo.tickLower,
    eventInfo.tickUpper,
  );

  if (existingPosition) {
    // this position has already performed a mint
    return;
  } else {
    // to keep things simple, we just need mints to make sure we capture and don't miss any lps
    // don't care about tracking notional liquidity provided by looking through updated mints and burns yet

    await insertNewMintAndNewPosition(bigQuery, eventInfo);
  }
};
