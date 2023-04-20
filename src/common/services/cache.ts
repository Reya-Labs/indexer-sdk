import { getRedis, setRedis } from './redisService';

export type GetFromBlockArgs = {
  syncProcessName: string;
  chainId: number;
  vammAddress: string;
};

export const getFromBlock = async ({
  syncProcessName,
  chainId,
  vammAddress,
}: GetFromBlockArgs): Promise<number> => {
  const processId = `${syncProcessName}_${chainId}_${vammAddress}`;

  return await getRedis(processId);
};

export type SetFromBlockArgs = {
  syncProcessName: string;
  chainId: number;
  vammAddress: string;
  lastBlock: number;
};

export const setFromBlock = async ({
  syncProcessName,
  chainId,
  vammAddress,
  lastBlock,
}: SetFromBlockArgs): Promise<boolean> => {
  const processId = `${syncProcessName}_${chainId}_${vammAddress}`;

  return await setRedis(processId, lastBlock);
};
