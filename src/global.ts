import { BigQuery } from "@google-cloud/bigquery";
import { Redis } from "ioredis";

import { PROJECT_ID, REDISHOST, REDISPORT } from "./common/constants";

let bigQuery: BigQuery | null = null;

export const getBigQuery = (): BigQuery => {
    if (bigQuery) {
        return bigQuery;
    }

    bigQuery = new BigQuery({
        projectId: PROJECT_ID,
    });

    return bigQuery;
}

let redisClient: Redis | null = null;

export const getRedisClient = (): Redis => {
    if (redisClient) {
        return redisClient;
    }

    redisClient = new Redis(REDISPORT, REDISHOST);
    return redisClient;
}