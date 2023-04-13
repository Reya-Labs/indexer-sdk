import { BigNumber, Event } from 'ethers';

import { parseMintOrBurnEvent } from '../../../src/common/mints-and-burns/parseMintOrBurnEvent';
import { ExtendedEvent } from '../../../src/common/types';
import { mockedAMM } from '../../utils';

describe('parse mint or burn event', () => {
  it('parse mint event', () => {
    const event = {
      blockHash: 'blockHash',
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

    expect(eventInfo).toEqual({
      eventId: 'blockhash_transactionhash_1',
      chainId: 1,
      vammAddress: 'amm-test',
      ownerAddress: '0x0000',
      tickLower: -1200,
      tickUpper: 1200,
      notionalDelta: 1.201,
      rateOracle: 'rate-oracle',
      underlyingToken: 'token',
      marginEngineAddress: 'margin-engine',
      amm: mockedAMM,
    });
  });

  it('parse burn event', () => {
    const event = {
      blockHash: 'blockHash',
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

    console.log(eventInfo);

    expect(eventInfo).toEqual({
      eventId: 'blockhash_transactionhash_1',
      chainId: 1,
      vammAddress: 'amm-test',
      ownerAddress: '0x0000',
      tickLower: -1200,
      tickUpper: 1200,
      notionalDelta: -1.201,
      rateOracle: 'rate-oracle',
      underlyingToken: 'token',
      marginEngineAddress: 'margin-engine',
      amm: mockedAMM,
    });
  });
});
