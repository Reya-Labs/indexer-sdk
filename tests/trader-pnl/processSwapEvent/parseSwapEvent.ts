// todo: bring tests back

// import { BigNumber, Event } from 'ethers';

// import { parseSwapEvent, SwapEventInfo } from '../../../src/common/event-parsers/parseSwapEvent';
// import { ExtendedEvent } from '../../../src/common/types';
// import { mockedAMM } from '../../utils';

// describe('parse swap event', () => {
//   it('parse swap event', () => {
//     const event = {
//       blockHash: 'blockHash',
//       blockNumber: 20,
//       transactionHash: 'transactionHash',
//       logIndex: 1,
//       args: {
//         recipient: '0x0000',
//         tickLower: -1200,
//         tickUpper: 1200,
//         variableTokenDelta: BigNumber.from(10).pow(18).mul(10),
//         fixedTokenDeltaUnbalanced: BigNumber.from(10).pow(18).mul(-50),
//         cumulativeFeeIncurred: BigNumber.from(10).pow(18).mul(1),
//       },
//     } as unknown as Event;

//     const extendedEvent: ExtendedEvent = {
//       ...event,
//       type: 'swap',
//       amm: mockedAMM,
//       chainId: 1,
//     };

//     const eventInfo = parseSwapEvent(extendedEvent);

//     const expectedEventInfo: SwapEventInfo = {
//       eventId: 'blockhash_transactionhash_1',
//       eventBlockNumber: 20,
//       chainId: 1,
//       vammAddress: 'amm-test',
//       ownerAddress: '0x0000',
//       tickLower: -1200,
//       tickUpper: 1200,

//       variableTokenDelta: 10,
//       fixedTokenDeltaUnbalanced: -50,
//       feePaidToLps: 1,

//       rateOracle: 'rate-oracle',
//       underlyingToken: 'token-name',
//       marginEngineAddress: 'margin-engine',
//     };

//     expect(eventInfo).toEqual(expectedEventInfo);
//   });
// });
