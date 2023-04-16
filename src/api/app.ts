import { BigQuery } from '@google-cloud/bigquery';
import cors from 'cors';
import * as dotenv from 'dotenv';
import express from 'express';

import { pullExistingPositionRow } from '../big-query-support';
import {
  GECKO_KEY,
  getLiquidityIndex,
  getTimeInYearsBetweenTimestamps,
  MINTS_BURNS_TABLE_ID,
  PROJECT_ID,
  SECONDS_IN_YEAR,
  SWAPS_TABLE_ID,
} from '../common';
import { getAmm, getBlockAtTimestamp } from './common';
import { ChainLevelInformation, getChainLevelInformation } from './common/getChainLevelInformation';

dotenv.config();

const bigQuery = new BigQuery({
  projectId: PROJECT_ID,
});

export const app = express();

app.use(cors());

app.get('/', (req, res) => {
  res.send('Welcome to Voltz API');
});

app.get('/chains/:chainId', async (req, res) => {
  if (GECKO_KEY === undefined) {
    throw Error('Make sure Coingecko Key is provided');
  }

  const chainId = Number(req.params.chainId);

  const result: ChainLevelInformation = await getChainLevelInformation({
    chainId: chainId,
    activeSwapsTableId: SWAPS_TABLE_ID,
    mintsAndBurnsTableId: MINTS_BURNS_TABLE_ID,
    bigQuery: bigQuery,
    geckoKey: GECKO_KEY,
  });

  res.json({
    volume30Day: result.volume30Day,
    totalLiquidity: result.totalLiquidity,
  });
});

app.get(
  '/positions/:chainId/:vammAddress/:ownerAddress/:tickLower/:tickUpper',
  async (req, res) => {
    console.log(`Requesting information about a position`);

    const chainId = Number(req.params.chainId);
    const vammAddress = req.params.vammAddress;
    const ownerAddress = req.params.ownerAddress;
    const tickLower = Number(req.params.tickLower);
    const tickUpper = Number(req.params.tickUpper);

    const existingPosition = await pullExistingPositionRow(
      bigQuery,
      chainId,
      vammAddress,
      ownerAddress,
      tickLower,
      tickUpper,
    );

    if (!existingPosition) {
      res.json({
        realizedPnLFromSwaps: null,
        realizedPnLFromFeesPaid: null,
        realizedPnLFromFeesCollected: null,
        unrealizedPnLFromSwaps: null,
      });

      return;
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
    const currentFixedRate = await amm.getFixedApr();

    const timeInYears = getTimeInYearsBetweenTimestamps(currentTimestamp, maturityTimestamp);

    const uPnL =
      existingPosition.netNotionalLocked *
      (currentFixedRate - existingPosition.netFixedRateLocked) *
      timeInYears;

    res.json({
      realizedPnLFromSwaps: rPnL,
      realizedPnLFromFeesPaid: existingPosition.realizedPnLFromFeesPaid,
      realizedPnLFromFeesCollected: existingPosition.realizedPnLFromFeesCollected,
      unrealizedPnLFromSwaps: uPnL,
    });
  },
);
