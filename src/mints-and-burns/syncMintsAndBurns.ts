import { getPreviousEvents } from '../common/contract-services/getPreviousEvents';
import { MintOrBurnEventInfo } from '../common/event-parsers/types';
import { getAmms } from '../common/getAmms';
import { getLatestProcessedBlock, setLatestProcessedBlock } from '../common/services/redisService';
import { processMintOrBurnEvent } from './processMintAndBurnEvent/processMintOrBurnEvent';

export const syncMintsAndBurns = async (chainIds: number[]): Promise<void> => {
  const lastProcessedBlocks: { [processId: string]: number } = {};

  const promises: Promise<void>[] = [];

  for (const chainId of chainIds) {
    const amms = await getAmms(chainId);
    const processId = `mints_and_burns_${chainId}`;

    if (amms.length === 0) {
      continue;
    }

    const fromBlock = (await getLatestProcessedBlock(processId)) + 1;
    const toBlock = await amms[0].provider.getBlockNumber();

    if (fromBlock >= toBlock) {
      continue;
    }

    lastProcessedBlocks[processId] = toBlock;

    console.log(
      `[Mint and burns, ${chainId}]: Processing between blocks ${fromBlock}-${toBlock}...`,
    );

    const chainPromises = amms.map(async (amm) => {
      const events = await getPreviousEvents(amm, ['mint', 'burn'], chainId, fromBlock, toBlock);

      if (events.length === 0) {
        return;
      }

      for (let i = 0; i < events.length; i++) {
        const event = events[i];
        await processMintOrBurnEvent(event as MintOrBurnEventInfo);
      }
    });

    promises.push(...chainPromises);
  }
  const output = await Promise.allSettled(promises);
  output.forEach((v) => {
    if (v.status === 'rejected') {
      throw v.reason;
    }
  });

  // Update Redis

  if (lastProcessedBlocks.length > 0) {
    console.log('[Mints and burns]: Caching to Redis...');
    for (const [processId, lastProcessedBlock] of Object.entries(lastProcessedBlocks)) {
      await setLatestProcessedBlock(processId, lastProcessedBlock);
    }
  }
};
