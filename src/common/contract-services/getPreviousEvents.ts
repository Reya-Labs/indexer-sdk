import { AMM } from '@voltz-protocol/v1-sdk';
import { ethers } from 'ethers';
import { ExtendedEvent } from '../types';

import { generateVAMMContract } from './generateVAMMContract';

export type VammEvents = {
  [ammId: string]: {
    events: ExtendedEvent[];
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
  eventTypes: string[],
  fromBlock: number,
  toBlock: number,
): Promise<VammEvents> => {
  const totalEventsByVammAddress: VammEvents = {};

  const promises = amms.map(async (amm): Promise<[AMM, ethers.Event[]]> => {
    const vammContract = generateVAMMContract(amm.id, amm.provider);

    let allEvents = [];
    
    for (let i=0; i<eventTypes.length; i++) {
      const eventType = eventTypes[i];
      const eventFilter = getEventFilter(vammContract, eventType);
      const events = await vammContract.queryFilter(eventFilter, fromBlock, toBlock);
      allEvents.push(...events);
    }

    return [amm, allEvents];
  });

  const response = await Promise.allSettled(promises);

  response.forEach((ammResponse) => {
    if (ammResponse.status === 'fulfilled') {
      const [amm, events] = ammResponse.value;

      const sortedEvents = events.sort((a, b) => {
        if (a.blockNumber === b.blockNumber) {
          return a.transactionIndex - b.transactionIndex;
        }

        return a.blockNumber - b.blockNumber;
      });

      totalEventsByVammAddress[amm.id] = {
        events: sortedEvents,
        amm,
      };
    } else {
      throw new Error(`Unable to retrieve events`);
    }
  });

  return totalEventsByVammAddress;
};
