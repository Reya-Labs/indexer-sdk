import { BigQuery } from '@google-cloud/bigquery';
import { Redis } from 'ioredis';

import { getLastProcessedBlock } from '../../big-query-support/getLastProcessedBlock';
import { setLastProcessedBlock } from '../../big-query-support/setLastProcessedBlock';
import { getRedis, setRedis } from './redisService';
import { LAST_PROCESSED_BLOCK_TABLE_ID } from '../constants';

export type GetFromBlockArgs = {
  syncProcessName: string;
  chainId: number;
  vammAddress: string;
  redisClient?: Redis;
  bigQuery?: BigQuery;
};

export const getFromBlock = async ({
  syncProcessName,
  chainId,
  vammAddress,
  redisClient,
  bigQuery,
}: GetFromBlockArgs): Promise<number> => {
  const processId = `${syncProcessName}_${chainId}_${vammAddress}`;

  if ((bigQuery !== undefined) && (LAST_PROCESSED_BLOCK_TABLE_ID !== '')) {
    return await getLastProcessedBlock(bigQuery, processId);
  }

  if (redisClient !== undefined) {
    return await getRedis(processId, redisClient);
  }

  return 0;
};

export type SetFromBlockArgs = {
  syncProcessName: string;
  chainId: number;
  vammAddress: string;
  lastBlock: number;
  redisClient?: Redis;
  bigQuery?: BigQuery;
};

export const setFromBlock = async ({
  syncProcessName,
  chainId,
  vammAddress,
  lastBlock,
  redisClient,
  bigQuery,
}: SetFromBlockArgs): Promise<boolean> => {
  const processId = `${syncProcessName}_${chainId}_${vammAddress}`;

  if (bigQuery !== undefined) {
    return await setLastProcessedBlock(bigQuery, processId, lastBlock);
  }

  if (redisClient !== undefined) {
    return await setRedis(processId, lastBlock, redisClient);
  }

  return false;
};
