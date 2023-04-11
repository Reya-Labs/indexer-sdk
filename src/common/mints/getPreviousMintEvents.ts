import { AMM } from '@voltz-protocol/v1-sdk';
import { ethers } from 'ethers';

import { generateVAMMContract } from '..';

export type VammMintEvents = {
  [ammId: string]: {
    mintEvents: ethers.Event[];
    amm: AMM;
  };
};

export const getPreviousMintEvents = async (
  amms: AMM[],
  previousBlockNumber: number,
): Promise<VammMintEvents> => {
  const totalEventsByVammAddress: VammMintEvents = {};

  const promises = amms.map(async (amm): Promise<[AMM, ethers.Event[]]> => {
    const vammContract = generateVAMMContract(amm.id, amm.provider);
    const mintEvents = await vammContract.queryFilter(
      vammContract.filters.Mint(),
      previousBlockNumber,
    );

    return [amm, mintEvents];
  });

  const response = await Promise.allSettled(promises);

  response.forEach((ammResponse) => {
    if (ammResponse.status === 'fulfilled') {
      const [amm, mintEvents] = ammResponse.value;

      totalEventsByVammAddress[amm.id] = {
        mintEvents,
        amm,
      };
    }
  });

  return totalEventsByVammAddress;
};
