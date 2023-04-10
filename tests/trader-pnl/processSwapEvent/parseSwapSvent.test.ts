import { BigNumber, Event } from 'ethers';

import { parseSwapEvent } from '../../../src/common/swaps/parseSwapEvent';
import { mockedAMM } from './utils';

describe('parse swap event', () => {
  it('parse swap event', () => {
    const event = {
      blockHash: 'blockHash',
      transactionHash: 'transactionHash',
      logIndex: 1,
      args: {
        recipient: '0x0000',
        tickLower: -1200,
        tickUpper: 1200,
        variableTokenDelta: BigNumber.from(10).pow(18).mul(10),
        fixedTokenDeltaUnbalanced: BigNumber.from(10).pow(18).mul(-50),
        cumulativeFeeIncurred: BigNumber.from(10).pow(18).mul(1),
      },
    } as unknown as Event;

    const eventInfo = parseSwapEvent(mockedAMM, event);

    expect(eventInfo).toEqual({
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
    });
  });
});
