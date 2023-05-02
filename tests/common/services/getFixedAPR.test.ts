import { getFixedApr } from '../../../src/api/common/getFixedAPR';

describe('get fixed APR', () => {
  it('fixed APR of stETH', async () => {
    const fixedApr = await getFixedApr(1, '0xb7edbed9c7ec58fb781a972091d94846a25097e9');

    expect(fixedApr).toBeCloseTo(0.050461171703695476);
  });
});
