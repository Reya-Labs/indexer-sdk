import { BigQuery } from '@google-cloud/bigquery';
import { AMM } from '@voltz-protocol/v1-sdk';
import { ethers } from 'ethers';

import {
  DATASET_ID,
  POSITIONS_TABLE_ID,
  PROJECT_ID,
  SWAPS_TABLE_ID,
  WAD,
} from '../common/constants';
import { getTimeInYearsBetweenTimestamps, getTimestampInSeconds } from '../common/utils';
import { PositionRow } from './pullExistingPositionRow';

const getFixedRateLocked = (
  variableTokenDelta: ethers.BigNumber,
  fixedTokenDeltaUnbalanced: ethers.BigNumber,
): number => {
  let fixedRateLocked = variableTokenDelta
    .mul(WAD)
    .div(fixedTokenDeltaUnbalanced)
    .div(ethers.BigNumber.from(10).pow(2));

  if (fixedRateLocked.lte(ethers.BigNumber.from(0))) {
    fixedRateLocked = fixedRateLocked.mul(ethers.BigNumber.from(-1));
  }

  return Number(ethers.utils.formatEther(fixedRateLocked));
};

const parseSwapEvent = async (amm: AMM, event: ethers.Event) => {
  const tokenDecimals = amm.underlyingToken.decimals;

  const ownerAddress = (event.args?.recipient as string).toLowerCase();
  const tickLower = event.args?.tickLower as number;
  const tickUpper = event.args?.tickUpper as number;

  const eventTimestamp = (await event.getBlock()).timestamp;

  const variableTokenDelta = event.args?.variableTokenDelta as ethers.BigNumber;
  const fixedTokenDeltaUnbalanced = event.args?.fixedTokenDeltaUnbalanced as ethers.BigNumber;
  const cumulativeFeeIncurred = event.args?.cumulativeFeeIncurred as ethers.BigNumber;

  return {
    vammAddress: amm.id.toLowerCase(),
    fixedRateLocked: getFixedRateLocked(variableTokenDelta, fixedTokenDeltaUnbalanced),
    notionalLocked: Number(ethers.utils.formatUnits(variableTokenDelta, tokenDecimals)),
    feePaidToLps: Number(ethers.utils.formatUnits(cumulativeFeeIncurred, tokenDecimals)),
    eventTimestamp,
    ownerAddress,
    tickLower,
    tickUpper,
  };
};

const generateSwapRow = async (
  bigQuery: BigQuery,
  amm: AMM,
  eventId: string,
  event: ethers.Event,
) => {
  const {
    vammAddress,
    fixedRateLocked,
    notionalLocked,
    feePaidToLps,
    eventTimestamp,
    ownerAddress,
    tickLower,
    tickUpper,
  } = await parseSwapEvent(amm, event);

  const rowLastUpdatedTimestamp = getTimestampInSeconds();

  return {
    eventId: eventId,
    vammAddress: vammAddress,
    ownerAddress: ownerAddress,
    tickLower: tickLower,
    tickUpper: tickUpper,
    notionalLocked: notionalLocked,
    fixedRateLocked: fixedRateLocked,
    feePaidToLps: feePaidToLps,
    eventTimestamp: bigQuery.timestamp(eventTimestamp).value,
    rowLastUpdatedTimestamp: bigQuery.timestamp(rowLastUpdatedTimestamp).value,
  };
};

const generateNewPositionRow = async (bigQuery: BigQuery, amm: AMM, event: ethers.Event) => {
  const {
    vammAddress,
    fixedRateLocked,
    notionalLocked,
    feePaidToLps,
    eventTimestamp,
    ownerAddress,
    tickLower,
    tickUpper,
  } = await parseSwapEvent(amm, event);

  const rowLastUpdatedTimestamp = getTimestampInSeconds();

  // todo: retrieve the margin engine address as well
  // todo: add variable and fixed token balances to the row

  return {
    marginEngineAddress: amm.marginEngineAddress,
    vammAddress: vammAddress,
    ownerAddress: ownerAddress,
    tickLower: tickLower,
    tickUpper: tickUpper,
    realizedPnLFromSwaps: 0,
    realizedPnLFromFeesPaid: feePaidToLps,
    netNotionalLocked: notionalLocked,
    netFixedRateLocked: fixedRateLocked,
    lastUpdatedTimestamp: bigQuery.timestamp(eventTimestamp).value,
    rowLastUpdatedTimestamp: bigQuery.timestamp(rowLastUpdatedTimestamp).value,
    notionalLiquidityProvided: 0,
    realizedPnLFromFeesCollected: 0,
    netMarginDeposited: 0,
  };
};

const getNetFixedRateLocked = (
  currentNetFixedRate: number,
  currentNetNotional: number,
  incomingSwapFixedRate: number,
  incomingSwapNotional: number,
): number => {
  let netFixedRateLocked = incomingSwapFixedRate;

  if (currentNetNotional > 0) {
    // currently net variable taker

    if (incomingSwapNotional > 0) {
      // variable taker is doubling down their variable taker exposure
      netFixedRateLocked =
        currentNetFixedRate * (currentNetNotional / (currentNetNotional + incomingSwapNotional)) +
        incomingSwapFixedRate *
          (incomingSwapNotional / (currentNetNotional + incomingSwapNotional));
    } else {
      // variable taker is bringing their exposure down

      if (incomingSwapNotional + currentNetNotional > 0) {
        netFixedRateLocked = currentNetFixedRate;
      }
    }
  } else {
    // currently net fixed taker

    if (incomingSwapNotional < 0) {
      // fixed taker is doubling down their fixed taker exposure
      netFixedRateLocked =
        currentNetFixedRate * (-currentNetNotional / (-currentNetNotional - incomingSwapNotional)) +
        incomingSwapFixedRate *
          (-incomingSwapNotional / (-currentNetNotional - incomingSwapNotional));
    } else {
      // fixed taker is bringing their exposure down

      if (incomingSwapNotional + currentNetNotional < 0) {
        netFixedRateLocked = currentNetFixedRate;
      }
    }
  }

  console.log(`net fixed rate locked is ${netFixedRateLocked}`);

  return netFixedRateLocked;
};

const getRealizedPnLSinceLastSwap = async (
  amm: AMM,
  currentTimestampInSeconds: number,
  lastUpdatedTimestampInSeconds: number,
  currentFixedRateNumber: number,
  currentNetNotionalNumber: number,
): Promise<number> => {
  const timeDeltaInYears = getTimeInYearsBetweenTimestamps(
    lastUpdatedTimestampInSeconds,
    currentTimestampInSeconds,
  );

  let fixedFactor = currentFixedRateNumber * timeDeltaInYears;

  if (currentNetNotionalNumber > 0) {
    fixedFactor = fixedFactor * -1.0;
  }

  const variableFactor = await amm.variableFactor(
    lastUpdatedTimestampInSeconds * 1000,
    currentTimestampInSeconds * 1000,
  );

  const realizedPnLSinceLastSwap = currentNetNotionalNumber * (variableFactor.scaled + fixedFactor);

  return realizedPnLSinceLastSwap;
};

const getRealizedPnLFromSwaps = async (
  amm: AMM,
  currentRealizedPnLFromSwaps: number,
  currentNetNotional: number,
  currentNetFixedRate: number,
  lastUpdatedTimestamp: number,
  eventTimestamp: number,
): Promise<number> => {
  const realizedPnLSinceLastSwap = await getRealizedPnLSinceLastSwap(
    amm,
    eventTimestamp,
    lastUpdatedTimestamp,
    currentNetFixedRate,
    currentNetNotional,
  );

  return currentRealizedPnLFromSwaps + realizedPnLSinceLastSwap;
};

async function generateUpdatedExistingPositionRow(
  bigQuery: BigQuery,
  amm: AMM,
  event: ethers.Event,
  existingPosition: PositionRow,
) {
  const {
    vammAddress,
    fixedRateLocked,
    notionalLocked,
    feePaidToLps,
    eventTimestamp,
    ownerAddress,
    tickLower,
    tickUpper,
  } = await parseSwapEvent(amm, event);

  const rowLastUpdatedTimestamp = getTimestampInSeconds();

  const netNotionalLocked = existingPosition.netNotionalLocked + notionalLocked;

  const netFixedRateLocked = getNetFixedRateLocked(
    existingPosition.netFixedRateLocked,
    existingPosition.netNotionalLocked,
    fixedRateLocked,
    notionalLocked,
  );

  const realizedPnLFromSwaps = await getRealizedPnLFromSwaps(
    amm,
    existingPosition.realizedPnLFromSwaps,
    existingPosition.netNotionalLocked,
    existingPosition.netFixedRateLocked,
    existingPosition.lastUpdatedTimestamp,
    eventTimestamp,
  );

  return {
    marginEngineAddress: amm.marginEngineAddress,
    vammAddress: vammAddress,
    ownerAddress: ownerAddress,
    tickLower: tickLower,
    tickUpper: tickUpper,
    realizedPnLFromSwaps: realizedPnLFromSwaps,
    realizedPnLFromFeesPaid: existingPosition.realizedPnLFromFeesPaid + feePaidToLps,
    netNotionalLocked: netNotionalLocked,
    netFixedRateLocked: netFixedRateLocked,
    lastUpdatedTimestamp: bigQuery.timestamp(eventTimestamp).value,
    rowLastUpdatedTimestamp: bigQuery.timestamp(rowLastUpdatedTimestamp).value,
    notionalLiquidityProvided: 0,
    realizedPnLFromFeesCollected: 0,
    netMarginDeposited: 0,
  };
}

export const insertNewSwapAndNewPosition = async (
  bigQuery: BigQuery,
  amm: AMM,
  eventId: string,
  event: ethers.Event,
): Promise<void> => {
  console.log('Inserting a new swap and a new position');

  const swapRow = await generateSwapRow(bigQuery, amm, eventId, event);
  const positionRow = await generateNewPositionRow(bigQuery, amm, event);

  const sqlTransactionQuery = `
            BEGIN 
            
            BEGIN TRANSACTION;
                
                INSERT INTO \`${PROJECT_ID}.${DATASET_ID}.${SWAPS_TABLE_ID}\`
                VALUES (\"${eventId}\",\"${swapRow.vammAddress}\",\"${swapRow.ownerAddress}\",
                ${swapRow.tickLower}, ${swapRow.tickUpper}, ${swapRow.notionalLocked}, ${
    swapRow.fixedRateLocked
  },
                ${swapRow.feePaidToLps}, \'${swapRow.eventTimestamp}\', \'${
    swapRow.rowLastUpdatedTimestamp
  }\');
                
                INSERT INTO \`${PROJECT_ID}.${DATASET_ID}.${POSITIONS_TABLE_ID}\`
                VALUES(
                    \"${positionRow.marginEngineAddress}\",
                    \"${positionRow.vammAddress}\",
                    \"${positionRow.ownerAddress}\",
                    ${positionRow.tickLower},
                    ${positionRow.tickUpper},
                    ${positionRow.realizedPnLFromSwaps},
                    ${positionRow.realizedPnLFromFeesPaid},
                    ${positionRow.netNotionalLocked},
                    ${positionRow.netFixedRateLocked},
                    \'${positionRow.lastUpdatedTimestamp}\',
                    ${positionRow.notionalLiquidityProvided},                
                    ${positionRow.realizedPnLFromFeesCollected},
                    ${positionRow.netMarginDeposited},
                    ${1},
                    \'${positionRow.rowLastUpdatedTimestamp}\',
                    ${0},
                    ${0}
                    );           

            COMMIT TRANSACTION;
            
            END;`;

  const options = {
    query: sqlTransactionQuery,
    timeoutMs: 100000,
    useLegacySql: false,
  };

  await bigQuery.query(options);

  console.log(
    `Inserted new swap with eventId: ${eventId} and inserted a new position for ${swapRow.ownerAddress}`,
  );
};

export const insertNewSwapAndUpdateExistingPosition = async (
  bigQuery: BigQuery,
  amm: AMM,
  eventId: string,
  event: ethers.Event,
  existingPosition: PositionRow,
): Promise<void> => {
  console.log('Inserting a new swap and updating an existing position');

  const swapRow = await generateSwapRow(bigQuery, amm, eventId, event);
  const positionRow = await generateUpdatedExistingPositionRow(
    bigQuery,
    amm,
    event,
    existingPosition,
  );

  const sqlTransactionQuery = `
          BEGIN 
            
            BEGIN TRANSACTION;
              
              INSERT INTO \`${PROJECT_ID}.${DATASET_ID}.${SWAPS_TABLE_ID}\`
                VALUES (\"${eventId}\",\"${swapRow.vammAddress}\",\"${swapRow.ownerAddress}\",
                ${swapRow.tickLower}, ${swapRow.tickUpper}, ${swapRow.notionalLocked}, ${swapRow.fixedRateLocked},
                ${swapRow.feePaidToLps}, \'${swapRow.eventTimestamp}\', \'${swapRow.rowLastUpdatedTimestamp}\');
              
              UPDATE \`${PROJECT_ID}.${DATASET_ID}.${POSITIONS_TABLE_ID}\`
                SET marginEngineAddress=\"${positionRow.marginEngineAddress}\",
                realizedPnLFromSwaps=${positionRow.realizedPnLFromSwaps},realizedPnLFromFeesPaid=${positionRow.realizedPnLFromFeesPaid},
                netNotionalLocked=${positionRow.netNotionalLocked},netFixedRateLocked=${positionRow.netFixedRateLocked},
                lastUpdatedTimestamp=\'${positionRow.lastUpdatedTimestamp}\',notionalLiquidityProvided=${positionRow.notionalLiquidityProvided},
                realizedPnLFromFeesCollected=${positionRow.realizedPnLFromFeesCollected},netMarginDeposited=${positionRow.netMarginDeposited},
                rowLastUpdatedTimestamp=\'${positionRow.rowLastUpdatedTimestamp}\'
                WHERE vammAddress=\"${positionRow.vammAddress}\" AND ownerAddress=\"${positionRow.ownerAddress}\" AND tickLower=${positionRow.tickLower} AND tickUpper=${positionRow.tickUpper};
  
            COMMIT TRANSACTION;
          
          END;`;

  const options = {
    query: sqlTransactionQuery,
    timeoutMs: 100000,
    useLegacySql: false,
  };

  await bigQuery.query(options);

  console.log(
    `Inserted new swap with eventId: ${eventId} and updated an existing position for ${swapRow.ownerAddress}`,
  );
};
