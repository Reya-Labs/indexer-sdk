import { main } from './index';

jest.setTimeout(50000);

describe('mainFn', () => {
  it('should work', async () => {
    const output = await main();
    expect(output).toBe('hello');
  });
});
