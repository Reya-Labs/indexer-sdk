// todo: bring tests back

// /* eslint-disable @typescript-eslint/no-unused-vars */
// /* eslint-disable @typescript-eslint/require-await */

// import { SwapEventInfo } from '../../../src/common/event-parsers/parseSwapEvent';
// import { generateSwapRow } from '../../../src/trader-pnl/processSwapEvent/generateSwapRow';

// describe('generate swap row', () => {
//   const eventInfo: SwapEventInfo = {
//     eventId: 'blockhash_transactionhash_1',
//     chainId: 1,
//     vammAddress: 'amm-test',
//     ownerAddress: '0x0000',
//     tickLower: -1200,
//     tickUpper: 1200,
//     eventBlockNumber: 100,

//     variableTokenDelta: 10,
//     fixedTokenDeltaUnbalanced: -50,
//     feePaidToLps: 1,

//     rateOracle: 'rate-oracle',
//     underlyingToken: 'token',
//     marginEngineAddress: 'margin-engine',
//   };

//   beforeAll(() => {
//     jest.useFakeTimers().setSystemTime(1609459200000);
//   });

//   it('swap row', () => {
//     const swapRow = generateSwapRow(eventInfo, 1609459200);

//     expect(swapRow.eventId).toBe('blockhash_transactionhash_1');
//     expect(swapRow.vammAddress).toBe('amm-test');
//     expect(swapRow.ownerAddress).toBe('0x0000');
//     expect(swapRow.tickLower).toBe(-1200);
//     expect(swapRow.tickUpper).toBe(1200);
//     expect(swapRow.variableTokenDelta).toBe(10);
//     expect(swapRow.fixedTokenDeltaUnbalanced).toBe(-50);
//     expect(swapRow.feePaidToLps).toBe(1);
//     expect(swapRow.eventTimestamp).toBe(1609459200);
//     expect(swapRow.rowLastUpdatedTimestamp).toBe(1609459200);
//     expect(swapRow.rateOracle).toBe('rate-oracle');
//     expect(swapRow.underlyingToken).toBe('token');
//     expect(swapRow.marginEngineAddress).toBe('margin-engine');
//     expect(swapRow.chainId).toBe(1);
//   });
// });
