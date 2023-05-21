import { getMarginEngineEvents } from '../common/contract-services/getMarginEngineEvents';
import { getAmms } from '../common/getAmms';
import { getProvider } from '../common/provider/getProvider';
import { getInformationPerMarginEngine, setRedis } from '../common/services/redisService';
import { processMarginUpdateEvent } from './processMarginUpdateEvent';

export const syncMarginUpdates = async (chainIds: number[]): Promise<void> => {
  const lastProcessedBlocks: { [processId: string]: number } = {};

  let promises: Promise<void>[] = [];

  for (const chainId of chainIds) {
    const amms = await getAmms(chainId);

    if (amms.length === 0) {
      continue;
    }

    const provider = getProvider(chainId);
    const currentBlock = await provider.getBlockNumber();

    console.log(`[Margin Updates, ${chainId}]: Processing up to block ${currentBlock}...`);

    const chainPromises = amms.map(async (amm) => {
      const { value: latestBlock, id: processId } = await getInformationPerMarginEngine(
        'last_block_margin_updates',
        chainId,
        amm.marginEngine,
      );

      const fromBlock = latestBlock + 1;
      const toBlock = currentBlock;

      if (fromBlock >= toBlock) {
        return;
      }

      lastProcessedBlocks[processId] = toBlock;

      const events = await getMarginEngineEvents(
        amm,
        ['margin_update'],
        chainId,
        fromBlock,
        toBlock,
      );

      if (events.length === 0) {
        return;
      }

      for (let i = 0; i < events.length; i++) {
        const event = events[i];
        await processMarginUpdateEvent(event );
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
    console.log('[Margin Updates]: Caching to Redis...');
    for (const [processId, lastProcessedBlock] of Object.entries(lastProcessedBlocks)) {
      await setRedis(processId, lastProcessedBlock);
    }
  }
};
