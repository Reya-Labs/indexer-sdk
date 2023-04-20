import { getRedisClient } from '../../global';

export const getLatestProcessedBlock = async (processId: string): Promise<number> => {
  const redisClient = getRedisClient();
  const value = await redisClient.get(processId);

  if (value) {
    return Number(value);
  }

  return 0;
}

export const setLatestProcessedBlock = async (processId: string, blockNumber: number): Promise<void> => {
  const redisClient = getRedisClient();
  await redisClient.set(processId, blockNumber);
}

export const getLatestProcessedTick = async (poolId: string): Promise<number> => {
  const redisClient = getRedisClient();
  const key = `${poolId}`;

  const value = await redisClient.get(key);
  if (value) {
    return Number(value);
  };

  return 0;
}

export const setLatestProcessedTick = async (poolId: string, tick: number): Promise<void> => {
  const redisClient = getRedisClient();
  const key = `${poolId}`;

  await redisClient.set(key, tick);
}
