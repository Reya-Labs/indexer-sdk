import { Redis } from 'ioredis';
export const REDISHOST = process.env.REDISHOST || 'localhost';
export const REDISPORT: number = Number(process.env.REDISPORT) || 6379;

export const getRedis = async (
  key: string,
  redisClient: Redis,
): Promise<number> => {    
  return Number(await redisClient.get(key));
}

export const setRedis = async (
  key: string,
  value: number,
  redisClient: Redis,
): Promise<boolean> => {

  try {
    await redisClient.set(key, value);
    return true;
  } catch (error) {
    console.log(`Setting last processed block in redis cache has failed with error: ${(error as Error).message}.`);
    return false;
  }

};
