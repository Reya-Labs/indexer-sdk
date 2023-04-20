import { AMM } from '@voltz-protocol/v1-sdk';

import { isTestingAccount } from '../constants';
import { parseMintOrBurnEvent } from '../event-parsers/parseMintOrBurnEvent';
import { parseSwapEvent } from '../event-parsers/parseSwapEvent';
import { parseVAMMPriceChangeEvent } from '../event-parsers/parseVAMMPriceChangeEvent';
import { EventInfo, EventType } from '../types';
import { generateVAMMContract } from './generateVAMMContract';

export const getPreviousEvents = async (
  amm: AMM,
  eventTypes: EventType[],
  chainId: number,
  fromBlock: number,
  toBlock: number,
): Promise<EventInfo[]> => {
  const allEvents: EventInfo[] = [];
  const vammContract = generateVAMMContract(amm.id, amm.provider);

  if (eventTypes.includes('mint')) {
    const eventFilter = vammContract.filters.Mint();
    let events = await vammContract.queryFilter(eventFilter, fromBlock, toBlock);

    events = events.filter((e) => isTestingAccount(e.args?.owner as string));

    const extendedEvents = events.map((event) => parseMintOrBurnEvent(event, amm, chainId, true));

    allEvents.push(...extendedEvents);
  }

  if (eventTypes.includes('burn')) {
    const eventFilter = vammContract.filters.Burn();
    let events = await vammContract.queryFilter(eventFilter, fromBlock, toBlock);

    events = events.filter((e) => isTestingAccount(e.args?.owner as string));

    const extendedEvents = events.map((event) => parseMintOrBurnEvent(event, amm, chainId, false));

    allEvents.push(...extendedEvents);
  }

  if (eventTypes.includes('swap')) {
    const eventFilter = vammContract.filters.Swap();
    let events = await vammContract.queryFilter(eventFilter, fromBlock, toBlock);

    events = events.filter((e) => isTestingAccount(e.args?.owner as string));

    const extendedEvents = events.map((event) => parseSwapEvent(event, amm, chainId));

    allEvents.push(...extendedEvents);
  }

  if (eventTypes.includes('price_change')) {
    const eventFilter = vammContract.filters.VAMMPriceChange();
    const events = await vammContract.queryFilter(eventFilter, fromBlock, toBlock);

    const extendedEvents = events.map((event) =>
      parseVAMMPriceChangeEvent(event, amm, chainId, false),
    );

    allEvents.push(...extendedEvents);
  }

  if (eventTypes.includes('price_change')) {
    const eventFilter = vammContract.filters.VAMMInitialization();
    const events = await vammContract.queryFilter(eventFilter, fromBlock, toBlock);

    const extendedEvents = events.map((event) =>
      parseVAMMPriceChangeEvent(event, amm, chainId, true),
    );

    allEvents.push(...extendedEvents);
  }

  const sortedEvents = allEvents.sort((a, b) => {
    if (a.blockNumber === b.blockNumber) {
      return a.transactionIndex - b.transactionIndex;
    }

    return a.blockNumber - b.blockNumber;
  });

  return sortedEvents;
};
