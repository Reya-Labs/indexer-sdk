import { Redis } from "ioredis";

const REDISHOST = process.env.REDISHOST || 'localhost';
const REDISPORT: number = Number(process.env.REDISPORT) || 6379;
const redis = new Redis(REDISPORT, REDISHOST);
redis.on('error', err => console.error('ERR:REDIS:', err));
redis.on('connect',() => {console.log('connected to redis successfully!');});


export const redisGet = async (
    key: string
): Promise<string | null> => {
    const result = redis.get(key);

    return result;

}


export const getFromBlock = async (
    tableId: string,
    chainId: number,
    vammAddress: string
): Promise<number> => {
    
    const redisKey = `${tableId}_${chainId}_${vammAddress}`;

    const fromBlock = Number(await redisGet(redisKey));
    
    return fromBlock;
}
