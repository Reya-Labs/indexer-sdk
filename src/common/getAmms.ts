import { AMM, getAMMs } from '@voltz-protocol/v1-sdk';

import { ALCHEMY_API_KEY, APR_2023_TIMESTAMP } from './constants';

export const getAmms = async (chainId: number): Promise<AMM[]> => {
  // Get AMMs
  const { amms, error } = await getAMMs({
    chainId: chainId,
    alchemyApiKey: ALCHEMY_API_KEY,
  });

  // If error, exit
  if (error) {
    throw new Error(`Couldn't fetch AMMs from voltz-SDK for chain id ${chainId}.`);
  }

  // Filter out the inactive pools
  const activeAmms = amms.filter((item) => {
    return item.termEndTimestampInMS / 1000 > APR_2023_TIMESTAMP;
  });

  // // todo: remove this, debugging purposes only
  // const activeAmms = amms.filter((item) => {
  //   if (item.id.toLowerCase() === '0xacf59c72660d1e6629a721fd958f7a8c64379835'.toLowerCase()) {
  //     return true;
  //   }

  //   return false;
  // });

  return activeAmms;
};
