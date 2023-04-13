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
  const activeAmms = amms.filter((item) => {
    // const ammsOfInterest = ['0x47C46765d633B6BC03d31cC224585c6856beeCB2'.toLowerCase(), '0x0f91a255B5bA8e59f3B97b1EDe91dEC88bcC17eb'.toLowerCase(), '0x7DF7Aa512F1EB4dd5C1b69486f45FE895ba41ECe'.toLowerCase(), '0x05cae5FE1FaAb605F795b018bE6bA979C2c89cdB'.toLowerCase(), '0xE07324a394aCFfF8fE24A09C3F2e2bD62e929eFb'.toLowerCase(), '0xEF05Af8b766B33e8c0FE768278deE326946a4858'.toLowerCase()];
    const ammsOfInterest = ['0xEF05Af8b766B33e8c0FE768278deE326946a4858'.toLowerCase()];
    if (!ammsOfInterest.includes(item.id)) {
      return false;
    }

    // const inconsistentAmmIDs = ['0x3806B99D0A0483E0D07501B31884c10e8E8b1215'];

    // if (inconsistentAmmIDs.includes(item.id)) {
    //   return false;
    // }

    return item.termEndTimestampInMS <= activeAtTimestamp * 1000;
  });

  return activeAmms;
};
