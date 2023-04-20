import { getPreviousEvents } from '../common/contract-services/getPreviousEvents';
import { MintOrBurnEventInfo } from '../common/event-parsers/types';
import { getAmms } from '../common/getAmms';
import { getLatestProcessedBlock, setLatestProcessedBlock } from '../common/services/redisService';
import { processMintOrBurnEvent } from './processMintAndBurnEvent/processMintOrBurnEvent';

export const syncMintsAndBurns = async (chainIds: number[]): Promise<void> => {
  const lastProcessedBlocks: { [processId: string]: number } = {};

  let promises: Promise<void>[] = [];

  for (const chainId of chainIds) {
    const amms = await getAmms(chainId);
    const processId = `mints_and_burns_${chainId}`;

    if (amms.length === 0) {
      return;
    }

    const fromBlock = (await getLatestProcessedBlock(processId)) + 1;
    const toBlock = await amms[0].provider.getBlockNumber();

    if (fromBlock >= toBlock) {
      continue;
    }

    lastProcessedBlocks[processId] = toBlock;

    const chainPromises = amms.map(async (amm) => {
      console.log(`Fetching events for AMM ${amm.id}`);

      const events = await getPreviousEvents(amm, ['mint', 'burn'], chainId, fromBlock, toBlock);

      if (events.length === 0) {
        return;
      }

      for (let i = 0; i < events.length; i++) {
        const event = events[i];
        console.log(`Processing event: ${event.type} (${i + 1}/${events.length})`);

        let trackingTime = Date.now().valueOf();

        await processMintOrBurnEvent(event as MintOrBurnEventInfo);

        console.log(`Event processing took ${Date.now().valueOf() - trackingTime} ms`);
        trackingTime = Date.now().valueOf();

        console.log();
      }
    });

    promises = promises.concat(...chainPromises);
  }

  const output = await Promise.allSettled(promises);
  output.forEach((v) => {
    if (v.status === 'rejected') {
      throw v.reason;
    }
  });

  // Update Redis

  console.log(`Writing to Redis...`);
  for (const [processId, lastProcessedBlock] of Object.entries(lastProcessedBlocks)) {
    await setLatestProcessedBlock(processId, lastProcessedBlock);
  }
};
