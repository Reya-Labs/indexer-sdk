import { Redis } from 'ioredis';

import { getRedis, setRedis } from './redisService';

export type GetFromBlockArgs = {
  syncProcessName: string;
  chainId: number;
  vammAddress: string;
  redisClient: Redis;
};

export const getFromBlock = async ({
  syncProcessName,
  chainId,
  vammAddress,
  redisClient,
}: GetFromBlockArgs): Promise<number> => {
  const processId = `${syncProcessName}_${chainId}_${vammAddress}`;

  return await getRedis(processId, redisClient);
};

export type SetFromBlockArgs = {
  syncProcessName: string;
  chainId: number;
  vammAddress: string;
  lastBlock: number;
  redisClient: Redis;
};

export const setFromBlock = async ({
  syncProcessName,
  chainId,
  vammAddress,
  lastBlock,
  redisClient,
}: SetFromBlockArgs): Promise<boolean> => {
  const processId = `${syncProcessName}_${chainId}_${vammAddress}`;

  return await setRedis(processId, lastBlock, redisClient);
};
