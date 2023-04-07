import { Storage } from '@google-cloud/storage';

import { PROJECT_ID } from '../../src/common/constants';
import { run } from '../../src/trader-pnl/run';

jest.setTimeout(50000);

// only for local testing
async function authenticateImplicitWithAdc() {
  const storage = new Storage({
    projectId: PROJECT_ID,
  });

  await storage.getBuckets();
};

describe('mainFn', () => {
  beforeAll(async () => {
    await authenticateImplicitWithAdc();
  })
  it('should work', async () => {
    const output = await run();
    expect(output).toBe('hello');
  });
});
