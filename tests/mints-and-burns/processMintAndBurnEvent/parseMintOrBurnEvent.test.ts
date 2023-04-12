import { Event } from 'ethers';
import { parseMintOrBurnEvent } from '../../../src/common/mints-and-burns/parseMintOrBurnEvent';
import { mockedAMM } from '../../utils';

describe('parse mint or burn event', () => {
  it('parse mint or burn event', () => {
    const event = {
      blockHash: 'blockHash',
      transactionHash: 'transactionHash',
      logIndex: 1,
      args: {
        owner: '0x0000',
        tickLower: -1200,
        tickUpper: 1200,
        amount: 100
      },
    } as unknown as Event;

    const eventInfo = parseMintOrBurnEvent(1, mockedAMM, event, false); 

    expect(eventInfo).toEqual({
      eventId: 'blockhash_transactionhash_1',
      chainId: 1,
      vammAddress: 'amm-test',
      ownerAddress: '0x0000',
      tickLower: -1200,
      tickUpper: 1200,
      notionalDelta: 100,
      rateOracle: 'rate-oracle',
      underlyingToken: 'token',
      marginEngineAddress: 'margin-engine',
    });
  });
});
