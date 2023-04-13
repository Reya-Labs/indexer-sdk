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

// constants
const apiPrefix = '/api';

// create app and setup middleware
export const app = express();

app.use(cors());

// Configure routes
const router = express.Router();

// Get realized & unrealized pnl of a position (then layer in lps through the same route)
router.get('/positions/:chainId/:vammAddress/:ownerAddress/:tickLower/:tickUpper', (req, res) => {
  const chainId = Number(req.params.chainId);
  const vammAddress = req.params.vammAddress;
  const ownerAddress = req.params.ownerAddress;
  const tickLower = Number(req.params.tickLower);
  const tickUpper = Number(req.params.tickUpper);

  const process = async () => {
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
        realizedPnLFromSwaps: 0,
        realizedPnLFromFeesPaid: 0,
        realizedPnLFromFeesCollected: 0,
        unrealizedPnLFromSwaps: 0,
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
  };

  process()
    .then((result) => {
      res.json(result);
    })
    .catch((error) => {
      console.log(`There is an error with message: ${(error as Error).message}`);
    });
});

router.get('/chains/:chainId', (req, res) => {
  const chainId = Number(req.params.chainId);

  const process = async () => {
    if (GECKO_KEY === undefined) {
      throw Error('Make sure Coingecko Key is provided');
    }
    const result: ChainLevelInformation = await getChainLevelInformation({
      chainId,
      activeSwapsTableId: SWAPS_TABLE_ID,
      mintsAndBurnsTableId: MINTS_BURNS_TABLE_ID,
      bigQuery: bigQuery,
      geckoKey: GECKO_KEY,
    });
    res.json({
      ...result,
    });
  };

  process()
    .then((result) => {
      res.json(result);
    })
    .catch((error) => {
      console.log(`There is an error with message: ${(error as Error).message}`);
    });
});

app.use(apiPrefix, router);
