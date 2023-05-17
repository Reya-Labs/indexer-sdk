import { BigQuery } from '@google-cloud/bigquery';
import { Storage } from '@google-cloud/storage';
import { Redis } from 'ioredis';

import { PROJECT_ID } from './big-query-support/utils';
import { REDISHOST, REDISPORT } from './common/constants';
import * as gcloudJson from './common/google-ips/cloud.json';
import { GCloudIpRanges } from './common/google-ips/types';

let bigQuery: BigQuery | null = null;
let redisClient: Redis | null = null;
export const chainIds = [1, 42161];
export const indexInactiveTimeInMS = 300_000; // 5 min

export const getBigQuery = (): BigQuery => {
  if (bigQuery) {
    return bigQuery;
  }

  bigQuery = new BigQuery({
    projectId: PROJECT_ID,
  });

  return bigQuery;
};

export const getRedisClient = (): Redis => {
  if (redisClient) {
    return redisClient;
  }

  redisClient = new Redis(REDISPORT, REDISHOST);
  return redisClient;
};

export const authenticateImplicitWithAdc = async () => {
  const storage = new Storage({
    projectId: PROJECT_ID,
  });

  await storage.getBuckets();
};

export const getTrustedProxies = () => {
  let trustedProxies: string[] = [];

  // Google Cloud IP address ranges
  // https://support.google.com/a/answer/10026322?hl=en
  for (const ipPrefixEntry of (gcloudJson as GCloudIpRanges).prefixes) {
    if (ipPrefixEntry.ipv4Prefix !== undefined) {
      trustedProxies.push(ipPrefixEntry.ipv4Prefix);
    }

    if (ipPrefixEntry.ipv6Prefix !== undefined) {
      trustedProxies.push(ipPrefixEntry.ipv6Prefix);
    }
  }

  // GCloud Load Balancer ranges
  // https://cloud.google.com/load-balancing/docs/https
  trustedProxies = trustedProxies.concat(["35.191.0.0/16", "130.211.0.0/22"]);

  // localhost
  trustedProxies = trustedProxies.concat(['::ffff:127.0.0.1', '::1']);

  return trustedProxies;
}