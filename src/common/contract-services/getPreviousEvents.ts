import { AMM } from '@voltz-protocol/v1-sdk';
import { ethers } from 'ethers';

import { generateVAMMContract } from './generateVAMMContract';

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
  amm: AMM,
  eventType: 'mint' | 'swap',
  fromBlock: number,
  toBlock: number,
): Promise<ethers.Event[]> => {
  const vammContract = generateVAMMContract(amm.id, amm.provider);
  const eventFilter = getEventFilter(vammContract, eventType);
  const events = await vammContract.queryFilter(eventFilter, fromBlock, toBlock);

  const sortedEvents = events.sort((a, b) => {
    if (a.blockNumber === b.blockNumber) {
      return a.transactionIndex - b.transactionIndex;
    }

    return a.blockNumber - b.blockNumber;
  });

  return sortedEvents;
};
