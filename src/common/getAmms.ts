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
  // // Filter out non-matured pools
  // const activeAmms = amms.filter((item) => {
  //   if (item.id.toLowerCase() === '0x7DF7Aa512F1EB4dd5C1b69486f45FE895ba41ECe'.toLowerCase()) {
  //     return true;
  //   }

  //   if (item.id.toLowerCase() === '0x47C46765d633B6BC03d31cC224585c6856beeCB2'.toLowerCase()) {
  //     return true;
  //   }

  //   if (item.id.toLowerCase() === '0xE07324a394aCFfF8fE24A09C3F2e2bD62e929eFb'.toLowerCase()) {
  //     return true;
  //   }

  //   if (item.id.toLowerCase() === '0x05cae5FE1FaAb605F795b018bE6bA979C2c89cdB'.toLowerCase()) {
  //     return true;
  //   }

  //   if (item.id.toLowerCase() === '0xEF05Af8b766B33e8c0FE768278deE326946a4858'.toLowerCase()) {
  //     return true;
  //   }

  //   return false;
  // });

  return activeAmms;
};
