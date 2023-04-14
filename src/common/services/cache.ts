import { BigQuery } from "@google-cloud/bigquery";
import { Redis } from "ioredis";
import { setLastProcessedBlock } from "../../big-query-support/setLastProcessedBlock";


export const getFromBlock = async (
  syncProcessName: string,
  chainId: number,
  vammAddress: string,
  redisClient?: Redis,
): Promise<number> => {

    if (redisClient === undefined) {
        // bq
    } else {
        // redis
    }
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

    }

};
