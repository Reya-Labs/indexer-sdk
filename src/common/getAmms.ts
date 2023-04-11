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

  // // Filter out the inactive pools
  // const activeAmms = amms.filter((item) => {
  //   return item.termEndTimestampInMS / 1000 > activeAtTimestamp;
  // });

  const activeAmms = amms.filter((item) => {
    return item.id.toLowerCase() === '0x9a37bcc8ff3055d7223b169bc9c9fe2157a1b60e'.toLowerCase();
  });

  return activeAmms;
};
