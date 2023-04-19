import { Redis } from 'ioredis';
export const REDISHOST = process.env.REDISHOST || 'localhost';
export const REDISPORT: number = Number(process.env.REDISPORT) || 6379;

export const getRedisClient = (): Redis => {
  const redisClient = new Redis(REDISPORT, REDISHOST);
  return redisClient;
};

export const getRedis = async (key: string, redisClient: Redis): Promise<number> => {
  const value = await redisClient.get(key);
  return Number(value || '0');
};

export const setRedis = async (
  key: string,
  value: number,
  redisClient: Redis,
): Promise<boolean> => {
  try {
    await redisClient.set(key, value);
    return true;
  } catch (error) {
    // console.log(`Setting last processed block in redis cache has failed with error: ${(error as Error).message}.`);
    return false;
  }
};
