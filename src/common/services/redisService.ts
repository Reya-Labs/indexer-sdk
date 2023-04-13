import { Redis } from 'ioredis';

const REDISHOST = process.env.REDISHOST || 'localhost';
const REDISPORT: number = Number(process.env.REDISPORT) || 6379;
const redis = new Redis(REDISPORT, REDISHOST);
let isRedisConnected = false;

redis.on('error', (err) => console.error('ERR:REDIS:', err));
redis.on('connect', () => {
  console.log('connected to redis successfully!');
  isRedisConnected = true;
});

export const getFromBlock = async (
  syncProcessName: string,
  chainId: number,
  vammAddress: string,
): Promise<number> => {

  if (isRedisConnected) {

    const redisKey = `${syncProcessName}_${chainId}_${vammAddress}`;

    const fromBlock = Number(await redis.get(redisKey));
  
    return fromBlock;

  } else {
    console.log('redis is not connected, defaulting to block 0');
    return 0; 
  }

};

export const setFromBlock = async (
  syncProcessName: string,
  chainId: number,
  vammAddress: string,
  value: number,
): Promise<void> => {

  if (isRedisConnected) { 
    const redisKey = `${syncProcessName}_${chainId}_${vammAddress}`;

    await redis.set(redisKey, value);
  } 

};
