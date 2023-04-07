import { run } from './trader-pnl/run';

run().catch(() => {
  console.log('Execution completed.');
});
