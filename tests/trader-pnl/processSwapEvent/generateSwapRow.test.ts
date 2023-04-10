/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/require-await */

import { generateSwapRow } from '../../../src/trader-pnl/processSwapEvent/generateSwapRow';
import { SwapEventInfo } from '../../../src/common/swaps/parseSwapEvent';

describe('generate swap row', () => {
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
    jest.useFakeTimers().setSystemTime(1609459200000);
  });

  it('swap row', () => {
    const swapRow = generateSwapRow(eventInfo, 1609459200);

    expect(swapRow.eventId).toBe('blockhash_transactionhash_1');
    expect(swapRow.vammAddress).toBe('amm-test');
    expect(swapRow.ownerAddress).toBe('0x0000');
    expect(swapRow.tickLower).toBe(-1200);
    expect(swapRow.tickUpper).toBe(1200);
    expect(swapRow.notionalLocked).toBe(10);
    expect(swapRow.fixedRateLocked).toBe(0.05);
    expect(swapRow.feePaidToLps).toBe(1);
    expect(swapRow.eventTimestamp).toBe(1609459200);
    expect(swapRow.rowLastUpdatedTimestamp).toBe(1609459200);
    expect(swapRow.rateOracle).toBe('rate-oracle');
    expect(swapRow.underlyingToken).toBe('token');
    expect(swapRow.marginEngineAddress).toBe('margin-engine');
    expect(swapRow.chainId).toBe(1);
  });
});
