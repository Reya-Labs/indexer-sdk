/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/require-await */

import { BigQueryPositionRow } from '../../../src/big-query-support';
import { generatePositionRow } from '../../../src/trader-pnl/processSwapEvent/generatePositionRow';
import { SwapEventInfo } from '../../../src/trader-pnl/processSwapEvent/parseSwapEvent';
import { mockedAMM } from './utils';

describe('generate position row', () => {
  const eventInfo = {
    eventId: 'blockhash_transactionhash_1',
    chainId: 1,
    vammAddress: 'amm-test',
    ownerAddress: '0x0000',
    tickLower: -1200,
    tickUpper: 1200,

    notionalLocked: 10,
    fixedRateLocked: 0.05,
    feePaidToLps: 1,

    rateOracle: 'rate-oracle',
    underlyingToken: 'token',
    marginEngineAddress: 'margin-engine',
  } as unknown as SwapEventInfo;

  beforeAll(() => {
    jest.useFakeTimers().setSystemTime(new Date('2020-01-01'));
  });

  it('non-existing position', async () => {
    const positionRow = await generatePositionRow(mockedAMM, eventInfo, 1681108156, null);

    expect(positionRow.marginEngineAddress).toBe('margin-engine');
    expect(positionRow.vammAddress).toBe('amm-test');
    expect(positionRow.ownerAddress).toBe('0x0000');
    expect(positionRow.tickLower).toBe(-1200);
    expect(positionRow.tickUpper).toBe(1200);
    expect(positionRow.realizedPnLFromSwaps).toBeCloseTo(-0);
    expect(positionRow.realizedPnLFromFeesPaid).toBe(1);
    expect(positionRow.netNotionalLocked).toBe(10);
    expect(positionRow.netFixedRateLocked).toBe(0.05);
    expect(positionRow.lastUpdatedTimestamp).toBe(1681108156);
    expect(positionRow.notionalLiquidityProvided).toBe(0);
    expect(positionRow.realizedPnLFromFeesCollected).toBe(0);
    expect(positionRow.netMarginDeposited).toBe(0);
    expect(positionRow.rateOracleIndex).toBe(1);
    expect(positionRow.rowLastUpdatedTimestamp).toBe(1577836800);
    expect(positionRow.fixedTokenBalance).toBe(0);
    expect(positionRow.variableTokenBalance).toBe(0);
    expect(positionRow.positionInitializationTimestamp).toBe(1681108156);
    expect(positionRow.rateOracle).toBe('rate-oracle');
    expect(positionRow.underlyingToken).toBe('token');
    expect(positionRow.chainId).toBe(1);
  });

  it('existing position', async () => {
    const existingPositionRow: BigQueryPositionRow = {
      marginEngineAddress: 'margin-engine-immutable',
      vammAddress: 'amm-test-immutable',
      ownerAddress: '0x0000-immutable',
      tickLower: -1200,
      tickUpper: 1200,
      realizedPnLFromSwaps: 0,
      realizedPnLFromFeesPaid: 1,
      netNotionalLocked: 10,
      netFixedRateLocked: 0.1,
      lastUpdatedTimestamp: 1681108156,
      notionalLiquidityProvided: 0,
      realizedPnLFromFeesCollected: 0,
      netMarginDeposited: 0,
      rateOracleIndex: 1,
      rowLastUpdatedTimestamp: 1577836800,
      fixedTokenBalance: 0,
      variableTokenBalance: 0,
      positionInitializationTimestamp: 1681108156,
      rateOracle: 'rate-oracle-immutable',
      underlyingToken: 'token-immutable',
      chainId: 1,
    };

    const positionRow = await generatePositionRow(
      mockedAMM,
      eventInfo,
      1712644156, // one year later
      existingPositionRow,
    );

    expect(positionRow.marginEngineAddress).toBe('margin-engine-immutable');
    expect(positionRow.vammAddress).toBe('amm-test-immutable');
    expect(positionRow.ownerAddress).toBe('0x0000-immutable');
    expect(positionRow.tickLower).toBe(-1200);
    expect(positionRow.tickUpper).toBe(1200);
    expect(positionRow.realizedPnLFromSwaps).toBeCloseTo(-0.7);
    expect(positionRow.realizedPnLFromFeesPaid).toBe(2);
    expect(positionRow.netNotionalLocked).toBe(20);
    expect(positionRow.netFixedRateLocked).toBe(0.075);
    expect(positionRow.lastUpdatedTimestamp).toBe(1681108156);
    expect(positionRow.notionalLiquidityProvided).toBe(0);
    expect(positionRow.realizedPnLFromFeesCollected).toBe(0);
    expect(positionRow.netMarginDeposited).toBe(0);
    expect(positionRow.rateOracleIndex).toBe(1);
    expect(positionRow.rowLastUpdatedTimestamp).toBe(1577836800);
    expect(positionRow.fixedTokenBalance).toBe(0);
    expect(positionRow.variableTokenBalance).toBe(0);
    expect(positionRow.positionInitializationTimestamp).toBe(1681108156);
    expect(positionRow.rateOracle).toBe('rate-oracle-immutable');
    expect(positionRow.underlyingToken).toBe('token-immutable');
    expect(positionRow.chainId).toBe(1);
  });
});
