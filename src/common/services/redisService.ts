import { getRedisClient } from '../../global';
import { getRedisID } from '../constants';

export const getLatestProcessedBlock = async (processId: string): Promise<number> => {
  const redisClient = getRedisClient();

  const key = `${getRedisID()}_${processId}`;
  const value = await redisClient.get(key);

  if (value) {
    return Number(value);
  }

  return 0;
};

export const setLatestProcessedBlock = async (
  processId: string,
  blockNumber: number,
): Promise<void> => {
  const redisClient = getRedisClient();
  const key = `${getRedisID()}_${processId}`;

  await redisClient.set(key, blockNumber);
};

export const getLatestProcessedTick = async (poolId: string): Promise<number> => {
  const redisClient = getRedisClient();
  const key = `${getRedisID()}_${poolId}`;

  const value = await redisClient.get(key);
  if (value) {
    return Number(value);
  }

  return 0;
};

export const setLatestProcessedTick = async (poolId: string, tick: number): Promise<void> => {
  const redisClient = getRedisClient();
  const key = `${getRedisID()}_${poolId}`;

  await redisClient.set(key, tick);
};
