import { pullAllPositions } from '../big-query-support/positions-table/pull-data/pullAllPositions';
import { updatePositions } from '../big-query-support/positions-table/push-data/updatePositions';
import { getVammEvents } from '../common/contract-services/getVammEvents';
import { SwapEventInfo } from '../common/event-parsers/types';
import { getAmms } from '../common/getAmms';
import { getLatestProcessedBlock, setLatestProcessedBlock } from '../common/services/redisService';
import { processSwapEvent } from './processSwapEvent';

export const syncTraderPnL = async (chainIds: number[]): Promise<void> => {
  const lastProcessedBlocks: { [processId: string]: number } = {};

  const currentPositions = await pullAllPositions();

  let promises: Promise<void>[] = [];
  for (const chainId of chainIds) {
    const amms = await getAmms(chainId);
    const processId = `trader_pnl_${chainId}`;

    if (amms.length === 0) {
      continue;
    }

    const fromBlock = (await getLatestProcessedBlock(processId)) + 1;
    const toBlock = await amms[0].provider.getBlockNumber();

    if (fromBlock >= toBlock) {
      continue;
    }

    lastProcessedBlocks[processId] = toBlock;

    console.log(`[Trader PnL, ${chainId}]: Processing between blocks ${fromBlock}-${toBlock}...`);

    const chainPromises = amms.map(async (amm) => {
      const events = await getVammEvents(amm, ['swap'], chainId, fromBlock, toBlock);

      if (events.length === 0) {
        return;
      }

      for (let i = 0; i < events.length; i++) {
        const event = events[i];
        await processSwapEvent(currentPositions, event as SwapEventInfo);
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

  // Push update to BigQuery
  if (currentPositions.length > 0) {
    await updatePositions('[Trader PnL]', currentPositions);
  }

  if (Object.entries(lastProcessedBlocks).length > 0) {
    // Update Redis
    console.log('[Trader PnL]: Caching to Redis...');
    for (const [processId, lastProcessedBlock] of Object.entries(lastProcessedBlocks)) {
      await setLatestProcessedBlock(processId, lastProcessedBlock);
    }
  }
};
