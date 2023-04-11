import { AMM } from '@voltz-protocol/v1-sdk';
import { ethers } from 'ethers';

import { generateVAMMContract } from './generateVAMMContract';

export type VammEvents = {
  [ammId: string]: {
    events: ethers.Event[];
    amm: AMM;
  };
};

const getEventFilter = (vammContract: ethers.Contract, eventType: string): ethers.EventFilter => {
  switch (eventType) {
    case 'mint': {
      return vammContract.filters.Mint();
    }
    case 'swap': {
      return vammContract.filters.Swap();
    }
    default: {
      throw new Error(`Unknown event type ${eventType}.`);
    }
  }
};

export const getPreviousEvents = async (
  amms: AMM[],
  eventType: 'mint' | 'swap',
  previousBlockNumber: number,
): Promise<VammEvents> => {
  const totalEventsByVammAddress: VammEvents = {};

  const promises = amms.map(async (amm): Promise<[AMM, ethers.Event[]]> => {
    const vammContract = generateVAMMContract(amm.id, amm.provider);
    const eventFilter = getEventFilter(vammContract, eventType);
    const events = await vammContract.queryFilter(eventFilter, previousBlockNumber);

    return [amm, events];
  });

  const response = await Promise.allSettled(promises);

  response.forEach((ammResponse) => {
    if (ammResponse.status === 'fulfilled') {
      const [amm, events] = ammResponse.value;

      totalEventsByVammAddress[amm.id] = {
        events,
        amm,
      };
    } else {
      throw new Error(`Unable to retrieve ${eventType} events`);
    }
  });

  return totalEventsByVammAddress;
};