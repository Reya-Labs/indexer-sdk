import { pullExistingPoolRow } from '../../big-query-support/pools-table/pull-data/pullExistingPoolRow';
import { BigQueryPoolRow } from '../../big-query-support/types';

export const getAmm = async (chainId: number, vammAddress: string): Promise<BigQueryPoolRow> => {
  // Get AMM
  const amm = await pullExistingPoolRow(vammAddress, chainId);

  if (!amm) {
    throw new Error(`Couldn't fetch AMM with address ${vammAddress}.`);
  }

  return amm;
};
