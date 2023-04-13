import { AMM } from '@voltz-protocol/v1-sdk';
import { ethers } from 'ethers';

import { getFromBlock } from '../services';
import { ExtendedEvent } from '../types';
import { generateVAMMContract } from './generateVAMMContract';

export type VammEvents = {
  [ammId: string]: {
    events: ExtendedEvent[];
  };
};

export const applyProcessingWindow = (
  events: ExtendedEvent[],
  blockWindow: number,
): ExtendedEvent[] => {
  if (events.length === 0) {
    return [];
  }

  const filteredEvents: ExtendedEvent[] = [];
  const latestBlock = 0;

  for (let i = 0; i < events.length; i++) {
    const currentEvent = events[i];
    const blocksSinceLatestEvent = currentEvent.blockNumber - latestBlock;

    if (blocksSinceLatestEvent >= blockWindow) {
      filteredEvents.push(currentEvent);
    }
  }

  return filteredEvents;
};

const getEventFilter = (vammContract: ethers.Contract, eventType: string): ethers.EventFilter => {
  switch (eventType) {
    case 'mint': {
      return vammContract.filters.Mint();
    }
    case 'swap': {
      return vammContract.filters.Swap();
    }
    case 'burn': {
      return vammContract.filters.Burn();
    }
    default: {
      throw new Error(`Unknown event type ${eventType}.`);
    }
  }
};

export const getPreviousEvents = async (
  tableId: string,
  amms: AMM[],
  eventTypes: ('mint' | 'burn' | 'swap')[],
): Promise<VammEvents> => {
  const totalEventsByVammAddress: VammEvents = {};

  const promises = amms.map(async (amm): Promise<[AMM, ExtendedEvent[]]> => {
    const toBlock = await amm.provider.getBlockNumber();
    const chainId = (await amm.provider.getNetwork()).chainId;

    const fromBlock = await getFromBlock(tableId, chainId, amm.id);

    const vammContract = generateVAMMContract(amm.id, amm.provider);

    const allEvents = [];

    for (let i = 0; i < eventTypes.length; i++) {
      const eventType: 'mint' | 'burn' | 'swap' = eventTypes[i];
      const eventFilter: ethers.EventFilter = getEventFilter(vammContract, eventType);
      const events: ethers.Event[] = await vammContract.queryFilter(
        eventFilter,
        fromBlock,
        toBlock,
      );
      const extendedEvents: ExtendedEvent[] = events.map((event) => {
        const extendedEvent = {
          ...event,
          type: eventType,
          amm: amm,
          chainId: chainId,
        };
        return extendedEvent;
      });

      allEvents.push(...extendedEvents);
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
      };
    } else {
      throw new Error(`Unable to retrieve events`);
    }
  });

  return totalEventsByVammAddress;
};
