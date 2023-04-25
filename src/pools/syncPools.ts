import { getProvider } from '@voltz-protocol/v1-sdk';

import { ALCHEMY_API_KEY, getFactory } from '../common/constants';
import { getFactoryEvents } from '../common/contract-services/getFactoryEvents';
import { getLatestProcessedBlock, setLatestProcessedBlock } from '../common/services/redisService';
import { processIrsInstanceEvent } from './processIrsInstanceEvent';

export const syncPools = async (chainIds: number[]): Promise<void> => {
  const lastProcessedBlocks: { [processId: string]: number } = {};

  for (const chainId of chainIds) {
    const processId = `pools_${chainId}`;
    const factory = getFactory(chainId.toString());
    const provider = getProvider(chainId, ALCHEMY_API_KEY);

    const fromBlock = (await getLatestProcessedBlock(processId)) + 1;
    const toBlock = await provider.getBlockNumber();

    if (fromBlock >= toBlock) {
      continue;
    }

    lastProcessedBlocks[processId] = toBlock;

    console.log(`[Pools, ${chainId}]: Processing between blocks ${fromBlock}-${toBlock}...`);

    const events = await getFactoryEvents(
      factory,
      provider,
      ['irs_pool_deployment'],
      chainId,
      fromBlock,
      toBlock,
    );

    if (events.length === 0) {
      return;
    }

    for (const event of events) {
      await processIrsInstanceEvent(event);
    }
  }

  // Update Redis

  if (Object.entries(lastProcessedBlocks).length > 0) {
    console.log('[Swaps]: Caching to Redis...');
    for (const [processId, lastProcessedBlock] of Object.entries(lastProcessedBlocks)) {
      await setLatestProcessedBlock(processId, lastProcessedBlock);
    }
  }
};
