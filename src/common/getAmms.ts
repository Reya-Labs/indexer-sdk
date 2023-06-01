import { pullAllChainPools } from '../big-query-support/pools-table/pull-data/pullAllChainPools';
import { BigQueryPoolRow } from '../big-query-support/types';

export const getAmms = async (chainId: number): Promise<BigQueryPoolRow[]> => {
  const amms = await pullAllChainPools([chainId]);

  return amms;
};
