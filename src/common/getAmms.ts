import { AMM, getAMMs } from '@voltz-protocol/v1-sdk';
import * as dotenv from 'dotenv';

dotenv.config();

export const getAmms = async (chainIds: number[], activeAtTimestamp: number): Promise<AMM[]> => {

  let allAmms: AMM[] = [];

  for (let i=0; i<chainIds.length; i++) {

    const chainId = chainIds[i];

    let alchemyApiKey = process.env.ALCHEMY_MAINNET_KEY;

    if (chainId === 42161) { 
      alchemyApiKey = process.env.ALCHEMY_ARBITRUM_KEY;
    }

    // Get AMMs
    const { amms, error } = await getAMMs({
      chainId: chainId,
      alchemyApiKey: process.env.ALCHEMY_KEY || '',
    });

    if (error) {
      throw new Error(`Couldn't fetch AMMs from voltz-SDK for chain id ${chainId}.`);
    }

    // Filter out the inactive pools
    const activeAmms = amms.filter((item) => {
      return item.termEndTimestampInMS / 1000 > activeAtTimestamp;
    });

    allAmms.push(...activeAmms);

  }


  return allAmms;
};
