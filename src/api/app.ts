import cors from 'cors';
import express from 'express';

import { getChainTradingVolume } from '../big-query-support/active-swaps-table/pull-data/getTradingVolume';
import { getFixedRates } from '../big-query-support/historical-rates/pull-data/getFixedRates';
import { getVariableRates } from '../big-query-support/historical-rates/pull-data/getVariableRates';
import { getChainTotalLiquidity } from '../big-query-support/mints-and-burns-table/pull-data/getTotalLiquidity';
import { pullAllChainPools } from '../big-query-support/pools-table/pull-data/pullAllChainPools';
import { pullExistingPoolRow } from '../big-query-support/pools-table/pull-data/pullExistingPoolRow';
import { pullExistingPositionRow } from '../big-query-support/positions-table/pull-data/pullExistingPositionRow';
import { SECONDS_IN_YEAR } from '../common/constants';
import { getCurrentTick } from '../common/contract-services/getCurrentTick';
import { getProvider } from '../common/provider/getProvider';
import { getLiquidityIndex } from '../common/services/getLiquidityIndex';
import { tickToFixedRate } from '../common/services/tickConversions';
import { getBlockAtTimestamp, getTimeInYearsBetweenTimestamps } from '../common/utils';
import { getAmm } from './common/getAMM';

export const app = express();

app.use(cors());

app.set('trust proxy', ['35.191.0.0/16', '130.211.0.0/22']);

app.get('/', (_, res) => {
  res.send('Welcome to Voltz API');
});

app.get('/ip', (req, res) => {
  res.send(req.ip);
});

// todo: to be deprecated when SDK stops consuming it
app.get('/chains/:chainId', (req, res) => {
  const process = async () => {
    const chainId = Number(req.params.chainId);

    const tradingVolume = await getChainTradingVolume([chainId]);

    const totalLiquidity = await getChainTotalLiquidity([chainId]);

    return {
      volume30Day: tradingVolume,
      totalLiquidity: totalLiquidity,
    };
  };

  process().then(
    (output) => {
      res.json(output);
    },
    (error) => {
      console.log(`API query failed with message ${(error as Error).message}`);
    },
  );
});

// todo: to be deprecated when SDK stops consuming it
app.get('/positions/:chainId/:vammAddress/:ownerAddress/:tickLower/:tickUpper', (req, res) => {
  console.log(`Requesting information about a position`);

  const process = async () => {
    const chainId = Number(req.params.chainId);
    const vammAddress = req.params.vammAddress;
    const ownerAddress = req.params.ownerAddress;
    const tickLower = Number(req.params.tickLower);
    const tickUpper = Number(req.params.tickUpper);

    const provider = getProvider(chainId);

    const existingPosition = await pullExistingPositionRow(
      chainId,
      vammAddress,
      ownerAddress,
      tickLower,
      tickUpper,
    );

    if (!existingPosition) {
      return {
        realizedPnLFromSwaps: 0,
        realizedPnLFromFeesPaid: 0,
        realizedPnLFromFeesCollected: 0,
        unrealizedPnLFromSwaps: 0,
      };
    }

    const amm = await getAmm(chainId, vammAddress);
    const maturityTimestamp = Math.floor(amm.termEndTimestampInMS / 1000);
    let currentTimestamp = (await provider.getBlock('latest')).timestamp;

    let currentLiquidityIndex = 1;

    if (maturityTimestamp >= currentTimestamp) {
      currentLiquidityIndex = await getLiquidityIndex(chainId, amm.marginEngine);
    } else {
      const blockAtSettlement = await getBlockAtTimestamp(provider, maturityTimestamp);

      currentLiquidityIndex = await getLiquidityIndex(chainId, amm.marginEngine, blockAtSettlement);

      currentTimestamp = maturityTimestamp;
    }

    // realized PnL
    const rPnL =
      existingPosition.cashflowLiFactor * currentLiquidityIndex +
      (existingPosition.cashflowTimeFactor * currentTimestamp) / SECONDS_IN_YEAR +
      existingPosition.cashflowFreeTerm;

    // unrealized PnL
    const currentTick = await getCurrentTick(chainId, vammAddress);
    const currentFixedRate = tickToFixedRate(currentTick);

    const timeInYears = getTimeInYearsBetweenTimestamps(currentTimestamp, maturityTimestamp);

    const uPnL =
      existingPosition.netNotionalLocked *
      (currentFixedRate - existingPosition.netFixedRateLocked) *
      timeInYears;

    return {
      realizedPnLFromSwaps: rPnL,
      realizedPnLFromFeesPaid: existingPosition.realizedPnLFromFeesPaid,
      realizedPnLFromFeesCollected: existingPosition.realizedPnLFromFeesCollected,
      unrealizedPnLFromSwaps: uPnL,
    };
  };

  process().then(
    (output) => {
      res.json(output);
    },
    (error) => {
      console.log(`API query failed with message ${(error as Error).message}`);
    },
  );
});

// todo: to be deprecated when SDK stops consuming it
app.get('/chain-pools/:chainId', (req, res) => {
  const process = async () => {
    const chainId = Number(req.params.chainId);

    const pools = await pullAllChainPools([chainId]);

    return pools;
  };

  process().then(
    (output) => {
      res.json(output);
    },
    (error) => {
      console.log(`API query failed with message ${(error as Error).message}`);
    },
  );
});

app.get('/pool/:chainId/:vammAddress', (req, res) => {
  const process = async () => {
    const chainId = Number(req.params.chainId);
    const vammAddress = req.params.vammAddress.toLowerCase();

    const pool = await pullExistingPoolRow(vammAddress, chainId);

    if (!pool) {
      throw new Error(`Pool ${vammAddress} does not exist on chain ${chainId}.`);
    }

    return pool;
  };

  process().then(
    (output) => {
      res.json(output);
    },
    (error) => {
      console.log(`API query failed with message ${(error as Error).message}`);
    },
  );
});

app.get('/chain-information/:chainIds', (req, res) => {
  const process = async () => {
    console.log('chainIds', req.params.chainIds);
    const chainIds = req.params.chainIds.split('&').map((s) => Number(s));

    const response = await Promise.allSettled([
      getChainTradingVolume(chainIds),
      getChainTotalLiquidity(chainIds),
    ]);

    if (response[0].status === 'rejected' || response[1].status === 'rejected') {
      throw new Error(`Couldn't fetch chain information.`);
    }

    return {
      volume30Day: response[0].value,
      totalLiquidity: response[1].value,
    };
  };

  process().then(
    (output) => {
      res.json(output);
    },
    (error) => {
      console.log(`API query failed with message ${(error as Error).message}`);
    },
  );
});

app.get('/all-pools/:chainIds', (req, res) => {
  const process = async () => {
    const chainIds = req.params.chainIds.split('&').map((s) => Number(s));

    const pools = await pullAllChainPools(chainIds);

    return pools;
  };

  process().then(
    (output) => {
      res.json(output);
    },
    (error) => {
      console.log(`API query failed with message ${(error as Error).message}`);
    },
  );
});

app.get('/position-pnl/:chainId/:vammAddress/:ownerAddress/:tickLower/:tickUpper', (req, res) => {
  console.log(`Requesting information about a position`);

  const process = async () => {
    const chainId = Number(req.params.chainId);
    const vammAddress = req.params.vammAddress;
    const ownerAddress = req.params.ownerAddress;
    const tickLower = Number(req.params.tickLower);
    const tickUpper = Number(req.params.tickUpper);

    const provider = getProvider(chainId);

    const existingPosition = await pullExistingPositionRow(
      chainId,
      vammAddress,
      ownerAddress,
      tickLower,
      tickUpper,
    );

    if (!existingPosition) {
      return {
        realizedPnLFromSwaps: 0,
        realizedPnLFromFeesPaid: 0,
        realizedPnLFromFeesCollected: 0,
        unrealizedPnLFromSwaps: 0,
      };
    }

    const amm = await getAmm(chainId, vammAddress);
    const maturityTimestamp = Math.floor(amm.termEndTimestampInMS / 1000);
    let currentTimestamp = (await provider.getBlock('latest')).timestamp;

    let currentLiquidityIndex = 1;

    if (maturityTimestamp >= currentTimestamp) {
      currentLiquidityIndex = await getLiquidityIndex(chainId, amm.marginEngine);
    } else {
      const blockAtSettlement = await getBlockAtTimestamp(provider, maturityTimestamp);

      currentLiquidityIndex = await getLiquidityIndex(chainId, amm.marginEngine, blockAtSettlement);

      currentTimestamp = maturityTimestamp;
    }

    // realized PnL
    const rPnL =
      existingPosition.cashflowLiFactor * currentLiquidityIndex +
      (existingPosition.cashflowTimeFactor * currentTimestamp) / SECONDS_IN_YEAR +
      existingPosition.cashflowFreeTerm;

    // unrealized PnL
    const currentTick = await getCurrentTick(chainId, vammAddress);
    const currentFixedRate = tickToFixedRate(currentTick);

    const timeInYears = getTimeInYearsBetweenTimestamps(currentTimestamp, maturityTimestamp);

    const uPnL =
      existingPosition.netNotionalLocked *
      (currentFixedRate - existingPosition.netFixedRateLocked) *
      timeInYears;

    return {
      realizedPnLFromSwaps: rPnL,
      realizedPnLFromFeesPaid: existingPosition.realizedPnLFromFeesPaid,
      realizedPnLFromFeesCollected: existingPosition.realizedPnLFromFeesCollected,
      unrealizedPnLFromSwaps: uPnL,
    };
  };

  process().then(
    (output) => {
      res.json(output);
    },
    (error) => {
      console.log(`API query failed with message ${(error as Error).message}`);
    },
  );
});

app.get('/fixed-rates/:chainId/:vammAddress/:startTimestamp/:endTimestamp', (req, res) => {
  console.log(`Requesting information about historical fixed rates`);

  const process = async () => {
    const chainId = Number(req.params.chainId);
    const vammAddress = req.params.vammAddress;
    const startTimestamp = Number(req.params.startTimestamp);
    const endTimestamp = Number(req.params.endTimestamp);

    const historicalRates = await getFixedRates(chainId, vammAddress, startTimestamp, endTimestamp);

    return historicalRates;
  };

  process().then(
    (output) => {
      res.json(output);
    },
    (error) => {
      console.log(`API query failed with message ${(error as Error).message}`);
    },
  );
});

app.get('/variable-rates/:chainId/:rateOracleAddress/:startTimestamp/:endTimestamp', (req, res) => {
  console.log(`Requesting information about historical variable rates`);

  const process = async () => {
    const chainId = Number(req.params.chainId);
    const rateOracleAddress = req.params.rateOracleAddress;
    const startTimestamp = Number(req.params.startTimestamp);
    const endTimestamp = Number(req.params.endTimestamp);

    const historicalRates = await getVariableRates(
      chainId,
      rateOracleAddress,
      startTimestamp,
      endTimestamp,
    );

    return historicalRates;
  };

  process().then(
    (output) => {
      res.json(output);
    },
    (error) => {
      console.log(`API query failed with message ${(error as Error).message}`);
    },
  );
});
