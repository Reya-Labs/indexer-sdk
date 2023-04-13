import { AMM, getAMMs } from '@voltz-protocol/v1-sdk';
import * as dotenv from 'dotenv';

dotenv.config();

export const getAmms = async (chainId: number, activeAtTimestamp: number): Promise<AMM[]> => {
  // Get AMMs
  const { amms, error } = await getAMMs({
    chainId: chainId,
    alchemyApiKey: process.env.ALCHEMY_KEY || '',
  });

  if (error) {
    throw new Error(`Couldn't fetch AMMs from voltz-SDK.`);
  }

  // Filter out the inactive pools
  return amms.filter((item) => {
    return item.termEndTimestampInMS > activeAtTimestamp * 1000;
  });

  // return amms.filter((amm) => {
  //   if (amm.id.toLowerCase() === '0x7df7aa512f1eb4dd5c1b69486f45fe895ba41ece'.toLowerCase()) {
  //     return true;
  //   }

  //   return false;
  // });
};
