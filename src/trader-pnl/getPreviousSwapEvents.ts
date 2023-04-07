import { AMM } from '@voltz-protocol/v1-sdk';
import { ethers } from 'ethers';

import { generateVAMMContract } from '../common/generateVAMMContract';

export type VammSwapEvents = {
  [ammId: string]: {
    swapEvents: ethers.Event[];
    amm: AMM;
  };
};

export const getPreviousSwapEvents = async (
  provider: ethers.providers.Provider, 
  amms: AMM[]
): Promise<VammSwapEvents> => {
  const totalEventsByVammAddress: VammSwapEvents = {};

  const promises = amms.map(async (amm): Promise<[AMM, ethers.Event[]]> => {
    const vammContract = generateVAMMContract(amm.id, provider);
    const swapEvents = await vammContract.queryFilter(vammContract.filters.Swap());
    return [amm, swapEvents];
  });

  const response = await Promise.allSettled(promises);

  response.forEach((ammResponse) => {
    if (ammResponse.status === 'fulfilled') {
      const [amm, swapEvents] = ammResponse.value;


      totalEventsByVammAddress[amm.id] = {
        swapEvents,
        amm,
      };
    }
  });

  return totalEventsByVammAddress;
};
