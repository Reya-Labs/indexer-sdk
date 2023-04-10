import { AMM } from '@voltz-protocol/v1-sdk';
import { ethers } from 'ethers';

import { generateVAMMContract } from '..';

export type VammSwapEvents = {
  [ammId: string]: {
    swapEvents: ethers.Event[];
    amm: AMM;
  };
};

export const getPreviousSwapEvents = async (
  amms: AMM[],
  previousBlockNumber: number,
): Promise<VammSwapEvents> => {
  const totalEventsByVammAddress: VammSwapEvents = {};

  const promises = amms.map(async (amm): Promise<[AMM, ethers.Event[]]> => {
    const vammContract = generateVAMMContract(amm.id, amm.provider);
    const swapEvents = await vammContract.queryFilter(
      vammContract.filters.Swap(),
      previousBlockNumber,
    );

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
