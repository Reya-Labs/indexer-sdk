import { BigQuery } from "@google-cloud/bigquery";
import { Redis } from "ioredis";
import { getLastProcessedBlock } from "../../big-query-support/getLastProcessedBlock";
import { setLastProcessedBlock } from "../../big-query-support/setLastProcessedBlock";
import { getRedis, setRedis } from "./redisService";


export const getFromBlock = async (
  syncProcessName: string,
  chainId: number,
  vammAddress: string,
  redisClient?: Redis,
  bigQuery?: BigQuery
): Promise<number> => {

    const processId =`${syncProcessName}_${chainId}_${vammAddress}`;

    if (bigQuery !== undefined) {
        return (await getLastProcessedBlock(bigQuery, processId));
    }

    if (redisClient !== undefined) {
        return (await getRedis(processId, redisClient));
    }

    return 0;

};

export const setFromBlock = async (
  syncProcessName: string,
  chainId: number,
  vammAddress: string,
  lastBlock: number,
  redisClient?: Redis,
  bigQuery?: BigQuery
): Promise<void> => {

    const processId =`${syncProcessName}_${chainId}_${vammAddress}`;

    if (bigQuery !== undefined) {
        await setLastProcessedBlock(bigQuery, processId, lastBlock);
    }

    if (redisClient !== undefined) { 
        await setRedis(processId, lastBlock, redisClient);
    }

};
