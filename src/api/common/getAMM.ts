import { AMM, getAMMs } from '@voltz-protocol/v1-sdk';
import * as dotenv from 'dotenv';

dotenv.config();

export const getAmm = async (chainId: number, vammAddress: string): Promise<AMM> => {
  // Get AMMs
  const { amms, error } = await getAMMs({
    chainId: chainId,
    alchemyApiKey: process.env.ALCHEMY_KEY || '',
  });

  if (error) {
    throw new Error(`Couldn't fetch AMMs from voltz-SDK.`);
  }

  // Filter out the inactive pools
  const amm = amms.find((item) => item.id.toLowerCase() === vammAddress.toLowerCase());

  if (amm) {
    return amm;
  }

  throw new Error(`AMM ${vammAddress} was not found.`);
};
