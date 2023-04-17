import { BigQuery } from '@google-cloud/bigquery';
import { AMM } from '@voltz-protocol/v1-sdk';
import { ethers } from 'ethers';

import { getFromBlock } from '../services';
import { ExtendedEvent } from '../types';
import { generateVAMMContract } from './generateVAMMContract';

export type VammEvents = {
  [ammId: string]: {
    events: ExtendedEvent[];
    fromBlock: number;
  };
};

// todo: test
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
    case 'price_change': {
      return vammContract.filters.VAMMPriceChange();
    }
    default: {
      throw new Error(`Unknown event type ${eventType}.`);
    }
  }
};

// todo: test and break down
export const getPreviousEvents = async (
  syncProcessName: 'active_swaps' | 'mints_lp' | 'passive_swaps_lp' | 'mint_burn' | 'lp_speed',
  amms: AMM[],
  eventTypes: ('mint' | 'burn' | 'swap' | 'price_change')[],
  bigQuery: BigQuery,
): Promise<VammEvents> => {
  const totalEventsByVammAddress: VammEvents = {};

  const promises = amms.map(async (amm): Promise<[AMM, ExtendedEvent[], number]> => {
    
    const toBlock = await amm.provider.getBlockNumber();
    const chainId = (await amm.provider.getNetwork()).chainId;

    const fromBlock = await getFromBlock({
      syncProcessName,
      chainId,
      vammAddress: amm.id,
      bigQuery: bigQuery,
    });

    const vammContract = generateVAMMContract(amm.id, amm.provider);

    const allEvents = [];

    for (let i = 0; i < eventTypes.length; i++) {
      const eventType: 'mint' | 'burn' | 'swap' | 'price_change' = eventTypes[i];
      const eventFilter: ethers.EventFilter = getEventFilter(vammContract, eventType);
      const events: ethers.Event[] = await vammContract.queryFilter(
        eventFilter,
        fromBlock,
        toBlock,
      );

      const extendedEvents: ExtendedEvent[] = await Promise.all(
        events.map(async (event) => {
          const extendedEvent = {
            ...event,
            type: eventType,
            amm: amm,
            chainId: chainId
          };
          return extendedEvent;
        }),
      );

      allEvents.push(...extendedEvents);
    }

    return [amm, allEvents, fromBlock];
  });

  const response = await Promise.allSettled(promises);

  response.forEach((ammResponse) => {
    if (ammResponse.status === 'fulfilled') {
      const [amm, events, fromBlock] = ammResponse.value;

      const sortedEvents = events.sort((a, b) => {
        if (a.blockNumber === b.blockNumber) {
          return a.transactionIndex - b.transactionIndex;
        }

        return a.blockNumber - b.blockNumber;
      });

      totalEventsByVammAddress[amm.id] = {
        events: sortedEvents,
        fromBlock: fromBlock,
      };

      console.log("here");
    } else {
      throw new Error(`Unable to retrieve events`);
    }
  });

  return totalEventsByVammAddress;
};
