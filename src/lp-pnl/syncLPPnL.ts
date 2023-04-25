import { pullAllPositions } from '../big-query-support/positions-table/pull-data/pullAllPositions';
import { updatePositions } from '../big-query-support/positions-table/push-data/updatePositions';
import { getPreviousEvents } from '../common/contract-services/getPreviousEvents';
import { MintOrBurnEventInfo, VAMMPriceChangeEventInfo } from '../common/event-parsers/types';
import { getAmms } from '../common/getAmms';
import {
  getLatestProcessedBlock,
  getLatestProcessedTick,
  setLatestProcessedBlock,
  setLatestProcessedTick,
} from '../common/services/redisService';
import { processMintOrBurnEvent } from './processEvents/processMintOrBurnEvent';
import { processVAMMPriceChangeEvent } from './processEvents/processVAMMPriceChangeEvent';

export const syncLPPnL = async (chainIds: number[]): Promise<void> => {
  const lastProcessedTicks: { [poolId: string]: number } = {};
  const lastProcessedBlocks: { [processId: string]: number } = {};

  const currentPositions = await pullAllPositions();

  let promises: Promise<void>[] = [];
  for (const chainId of chainIds) {
    const amms = await getAmms(chainId);
    const processId = `lp_pnl_${chainId}`;

    if (amms.length === 0) {
      continue;
    }

    const fromBlock = (await getLatestProcessedBlock(processId)) + 1;
    const toBlock = await amms[0].provider.getBlockNumber();

    if (fromBlock >= toBlock) {
      continue;
    }

    lastProcessedBlocks[processId] = toBlock;

    console.log(`[LP PnL, ${chainId}]: Processing between blocks ${fromBlock}-${toBlock}...`);

    const chainPromises = amms.map(async (amm) => {
      const events = await getPreviousEvents(
        amm,
        ['mint', 'burn', 'price_change'],
        chainId,
        fromBlock,
        toBlock,
      );

      if (events.length === 0) {
        return;
      }

      const poolId = `${chainId}_${amm.id.toLowerCase()}`;
      lastProcessedTicks[poolId] = await getLatestProcessedTick(poolId);

      for (let i = 0; i < events.length; i++) {
        const event = events[i];

        switch (event.type) {
          case 'mint':
          case 'burn': {
            processMintOrBurnEvent(currentPositions, event as MintOrBurnEventInfo);
            break;
          }
          case 'price_change': {
            await processVAMMPriceChangeEvent(
              currentPositions,
              event as VAMMPriceChangeEventInfo,
              lastProcessedTicks[poolId],
            );

            lastProcessedTicks[poolId] = (event as VAMMPriceChangeEventInfo).tick;
            break;
          }
          case 'vamm_initialization': {
            lastProcessedTicks[poolId] = (event as VAMMPriceChangeEventInfo).tick;
            break;
          }
          default: {
            throw new Error(`Unrecognized event type: ${event.type}`);
          }
        }
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
    await updatePositions('[LP PnL]', currentPositions);
  }

  // Update Redis

  if (Object.entries(lastProcessedBlocks).length > 0) {
    console.log('[LP PnL]: Caching to Redis...');
    for (const [processId, lastProcessedBlock] of Object.entries(lastProcessedBlocks)) {
      await setLatestProcessedBlock(processId, lastProcessedBlock);
    }

    for (const [poolId, tick] of Object.entries(lastProcessedTicks)) {
      await setLatestProcessedTick(poolId, tick);
    }
  }
};
