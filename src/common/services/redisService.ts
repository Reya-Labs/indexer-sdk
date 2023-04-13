import { Redis } from 'ioredis';
export const REDISHOST = process.env.REDISHOST || 'localhost';
export const REDISPORT: number = Number(process.env.REDISPORT) || 6379;


export const getFromBlock = async (
  syncProcessName: string,
  chainId: number,
  vammAddress: string,
  redisClient: Redis
): Promise<number> => {  

    const redisKey = `${syncProcessName}_${chainId}_${vammAddress}`;

    const fromBlock = Number(await redisClient.get(redisKey));

    return fromBlock;
};

export const setFromBlock = async (
  syncProcessName: string,
  chainId: number,
  vammAddress: string,
  value: number,
  redisClient: Redis
): Promise<void> => {

    const redisKey = `${syncProcessName}_${chainId}_${vammAddress}`;

    await redisClient.set(redisKey, value);

};
