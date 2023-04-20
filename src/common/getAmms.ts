import { AMM, getAMMs } from '@voltz-protocol/v1-sdk';

import { ALCHEMY_API_KEY } from './constants';

// import { APR_2023_TIMESTAMP } from './constants';

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

  // // Filter out the inactive pools
  // const activeAmms = amms.filter((item) => {
  //   return item.termEndTimestampInMS / 1000 > APR_2023_TIMESTAMP;
  // });

  // todo: remove this after testing
  const activeAmms = amms.filter((item) => {
    return item.id.toLowerCase() === '0x7DF7Aa512F1EB4dd5C1b69486f45FE895ba41ECe'.toLowerCase();
  });

  return activeAmms;
};
