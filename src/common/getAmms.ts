import { pullAllChainPools } from '../big-query-support/pools-table/pull-data/pullAllChainPools';
import { BigQueryPoolRow } from '../big-query-support/types';
import { APR_2023_TIMESTAMP } from './constants';

export const getAmms = async (chainId: number): Promise<BigQueryPoolRow[]> => {
  // Get AMMs
  const amms = await pullAllChainPools([chainId]);

  // todo: comment this, debugging purposes only
  // const activeAmms = amms.filter((item) => {
  //   if (item.vamm.toLowerCase() === '0xacf59c72660d1e6629a721fd958f7a8c64379835'.toLowerCase()) {
  //     return true;
  //   }

  //   return false;
  // });

  return amms;
};
