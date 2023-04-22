import { BigQuery } from '@google-cloud/bigquery';
import cors from 'cors';
import * as dotenv from 'dotenv';
import express from 'express';

import { getChainTotalLiquidity } from '../big-query-support/pull-data/getTotalLiquidity';
import { getChainTradingVolume } from '../big-query-support/pull-data/getTradingVolume';
import { pullExistingPositionRow } from '../big-query-support/pull-data/pullExistingPositionRow';
import {
  ACTIVE_SWAPS_TABLE_ID,
  GECKO_KEY,
  MINTS_BURNS_TABLE_ID,
  PROJECT_ID,
  SECONDS_IN_YEAR,
} from '../common/constants';
import { getLiquidityIndex } from '../common/services/getLiquidityIndex';
import { getBlockAtTimestamp, getTimeInYearsBetweenTimestamps } from '../common/utils';
import { getAmm } from './common/getAMM';

dotenv.config();

const bigQuery = new BigQuery({
  projectId: PROJECT_ID,
});

export const app = express();

app.use(cors());

app.get('/', (_, res) => {
  res.send('Welcome to Voltz API');
});

app.get('/chains/:chainId', (req, res) => {
  const process = async () => {
    const chainId = Number(req.params.chainId);

    const tradingVolume = await getChainTradingVolume({
      chainId: chainId,
      activeSwapsTableId: ACTIVE_SWAPS_TABLE_ID,
      bigQuery: bigQuery,
      geckoKey: GECKO_KEY,
    });

    const totalLiquidity = await getChainTotalLiquidity({
      chainId: chainId,
      mintsAndBurnsTableId: MINTS_BURNS_TABLE_ID,
      bigQuery: bigQuery,
      geckoKey: GECKO_KEY,
    });

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

app.get('/positions/:chainId/:vammAddress/:ownerAddress/:tickLower/:tickUpper', (req, res) => {
  console.log(`Requesting information about a position`);

  const process = async () => {
    const chainId = Number(req.params.chainId);
    const vammAddress = req.params.vammAddress;
    const ownerAddress = req.params.ownerAddress;
    const tickLower = Number(req.params.tickLower);
    const tickUpper = Number(req.params.tickUpper);

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
    let currentTimestamp = (await amm.provider.getBlock('latest')).timestamp;

    let currentLiquidityIndex = 1;

    if (maturityTimestamp >= currentTimestamp) {
      currentLiquidityIndex = await getLiquidityIndex(
        chainId,
        amm.provider,
        amm.marginEngineAddress,
      );
    } else {
      const blockAtSettlement = await getBlockAtTimestamp(amm.provider, maturityTimestamp);

      currentLiquidityIndex = await getLiquidityIndex(
        chainId,
        amm.provider,
        amm.marginEngineAddress,
        blockAtSettlement,
      );

      currentTimestamp = maturityTimestamp;
    }

    // realized PnL
    const rPnL =
      existingPosition.cashflowLiFactor * currentLiquidityIndex +
      (existingPosition.cashflowTimeFactor * currentTimestamp) / SECONDS_IN_YEAR +
      existingPosition.cashflowFreeTerm;

    // unrealized PnL
    // note: scaling by 100 since the raw output fixedApr is in percentage point terms
    const currentFixedRate = (await amm.getFixedApr())/100;

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
