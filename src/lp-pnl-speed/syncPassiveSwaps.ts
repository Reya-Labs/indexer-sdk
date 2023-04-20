import { pullAllPositions } from '../big-query-support/pull-data/pullAllPositions';
import { updatePositions } from '../big-query-support/push-data/updatePositions';
import { getPreviousEvents } from '../common/contract-services/getPreviousEvents';
import { MintOrBurnEventInfo, VAMMPriceChangeEventInfo } from '../common/event-parsers/types';
import { getAmms } from '../common/getAmms';
import {
  getLatestProcessedBlock,
  getLatestProcessedTick,
  setLatestProcessedBlock,
  setLatestProcessedTick,
} from '../common/services/redisService';
import { processMintOrBurnEventLpSpeed } from './processLpSpeedEvent/processMintOrBurnEventLpSpeed';
import { processVAMMPriceChangeEvent } from './processLpSpeedEvent/processVAMMPriceChangeEvent';

export const syncPassiveSwaps = async (chainIds: number[]): Promise<void> => {
  const lastProcessedTicks: { [poolId: string]: number } = {};
  const lastProcessedBlocks: { [processId: string]: number } = {};

  const currentPositions = await pullAllPositions();
  console.log(`Number of current positions:`, currentPositions.length);

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

    console.log(`Processing between blocks ${fromBlock}-${toBlock} for ${chainId}`);

    const chainPromises = amms.map(async (amm) => {
      console.log(`Fetching events for AMM ${amm.id}`);

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

      console.log(`Processing ${events.length} events from block ${fromBlock}...`);

      for (let i = 0; i < events.length; i++) {
        const event = events[i];
        console.log(`Processing event: ${event.type} (${i + 1}/${events.length})`);

        let trackingTime = Date.now().valueOf();

        switch (event.type) {
          case 'mint':
          case 'burn': {
            processMintOrBurnEventLpSpeed(currentPositions, event as MintOrBurnEventInfo);
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

  // Push update to BigQuery
  await updatePositions(currentPositions);

  // Update Redis

  console.log(`Writing to Redis...`);
  for (const [processId, lastProcessedBlock] of Object.entries(lastProcessedBlocks)) {
    await setLatestProcessedBlock(processId, lastProcessedBlock);
  }

  for (const [poolId, tick] of Object.entries(lastProcessedTicks)) {
    await setLatestProcessedTick(poolId, tick);
  }
};

// todo: what if fromBlock is > vamm initialization, needs to be handled in the get previous events function
// todo: double check the fact that events are properly ordered sicne last time
// checked and the initialization of the vammm didn't come up first
// note this must be the initialization tick
