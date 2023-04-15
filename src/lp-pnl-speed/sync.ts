import { BigQuery } from '@google-cloud/bigquery';
import { AMM } from '@voltz-protocol/v1-sdk';
import { Redis } from 'ioredis';

import { CACHE_SET_WINDOW, getPreviousEvents, setFromBlock } from '../common';
import { processMintEvent } from './processMintEvent';

export const sync = async (
  bigQuery: BigQuery,
  amms: AMM[],
  redisClient?: Redis,
): Promise<void> => {
  
  const previousMintBurnSwapEvents = await getPreviousEvents('lp_speed', amms, ['mint', 'burn', 'swap'], bigQuery);

  




};
