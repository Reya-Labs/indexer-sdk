import { BigNumber, Event } from 'ethers';

import { parseMintOrBurnEvent } from '../../../src/common/event-parsers/parseMintOrBurnEvent';
import { MintOrBurnEventInfo } from '../../../src/common/event-parsers/types';
import { ExtendedEvent } from '../../../src/common/types';
import { mockedAMM } from '../../utils';

describe('parse mint or burn event', () => {
  it('parse mint event', () => {
    const event = {
      blockHash: 'blockHash',
      blockNumber: 100,
      transactionHash: 'transactionHash',
      logIndex: 1,
      args: {
        owner: '0x0000',
        tickLower: -1200,
        tickUpper: 1200,
        amount: BigNumber.from(10).pow(18).mul(10),
      },
    } as unknown as Event;

    const extendedEvent: ExtendedEvent = {
      ...event,
      type: 'mint',
      amm: mockedAMM,
      chainId: 1,
    };

    const eventInfo = parseMintOrBurnEvent(extendedEvent);

    const expectedEventInfo: MintOrBurnEventInfo = {
      eventId: 'blockhash_transactionhash_1',
      type: 'mint',
      eventBlockNumber: 100,

      chainId: 1,
      vammAddress: 'amm-test',
      amm: mockedAMM,

      rateOracle: 'rate-oracle',
      underlyingToken: 'token-name',
      marginEngineAddress: 'margin-engine',

      ownerAddress: '0x0000',
      tickLower: -1200,
      tickUpper: 1200,

      notionalDelta: 1.201,
      liquidityDelta: 10,
    };

    expect(eventInfo).toEqual(expectedEventInfo);
  });

  it('parse burn event', () => {
    const event = {
      blockHash: 'blockHash',
      blockNumber: 100,
      transactionHash: 'transactionHash',
      logIndex: 1,
      args: {
        owner: '0x0000',
        tickLower: -1200,
        tickUpper: 1200,
        amount: BigNumber.from(10).pow(18).mul(10),
      },
    } as unknown as Event;

    const extendedEvent: ExtendedEvent = {
      ...event,
      type: 'burn',
      amm: mockedAMM,
      chainId: 1,
    };

    const eventInfo = parseMintOrBurnEvent(extendedEvent);

    const expectedEventInfo: MintOrBurnEventInfo = {
      eventId: 'blockhash_transactionhash_1',
      type: 'burn',
      eventBlockNumber: 100,

      chainId: 1,
      vammAddress: 'amm-test',
      amm: mockedAMM,

      rateOracle: 'rate-oracle',
      underlyingToken: 'token-name',
      marginEngineAddress: 'margin-engine',

      ownerAddress: '0x0000',
      tickLower: -1200,
      tickUpper: 1200,

      notionalDelta: -1.201,
      liquidityDelta: -10,
    };

    expect(eventInfo).toEqual(expectedEventInfo);
  });
});
