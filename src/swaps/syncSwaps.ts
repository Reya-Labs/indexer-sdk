import { getVammEvents } from '../common/contract-services/getVammEvents';
import { SwapEventInfo } from '../common/event-parsers/types';
import { getRecentAmms } from '../common/getAmms';
import { getProvider } from '../common/provider/getProvider';
import { getInformationPerVAMM, setRedis } from '../common/services/redisService';
import { processSwapEvent } from './processSwapEvent';

export const syncSwaps = async (chainIds: number[]): Promise<void> => {
  const lastProcessedBlocks: { [processId: string]: number } = {};

  let promises: Promise<void>[] = [];

  for (const chainId of chainIds) {
    const amms = await getRecentAmms(chainId);

    if (amms.length === 0) {
      continue;
    }

    const provider = getProvider(chainId);
    const currentBlock = await provider.getBlockNumber();

    console.log(`[Swaps, ${chainId}]: Processing up to block ${currentBlock}...`);

    const chainPromises = amms.map(async (amm) => {
      const { value: latestBlock, id: processId } = await getInformationPerVAMM(
        'last_block_active_swaps',
        chainId,
        amm.vamm,
      );

      const fromBlock = latestBlock + 1;
      const toBlock = currentBlock;

      if (fromBlock >= toBlock) {
        return;
      }

      lastProcessedBlocks[processId] = toBlock;

      const events = await getVammEvents(amm, ['swap'], chainId, fromBlock, toBlock);

      if (events.length === 0) {
        return;
      }

      for (let i = 0; i < events.length; i++) {
        const event = events[i];
        await processSwapEvent(event as SwapEventInfo);
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

  if (Object.entries(lastProcessedBlocks).length > 0) {
    console.log('[Swaps]: Caching to Redis...');
    for (const [processId, lastProcessedBlock] of Object.entries(lastProcessedBlocks)) {
      await setRedis(processId, lastProcessedBlock);
    }
  }
};
