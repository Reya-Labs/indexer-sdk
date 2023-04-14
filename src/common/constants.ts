import * as dotenv from 'dotenv';

dotenv.config();

export const cache: string | undefined = process.env.CACHE;

export const APR_2023_TIMESTAMP = 1680337863;

export const GECKO_KEY = process.env.COINGECKO_API_KEY;
export const PROJECT_ID = 'risk-monitoring-361911';
export const DATASET_ID = 'voltz_v1_positions';
export const SWAPS_TABLE_ID = process.env.SWAPS_TABLE_ID
  ? `${PROJECT_ID}.${DATASET_ID}.${process.env.SWAPS_TABLE_ID}`
  : '';
export const POSITIONS_TABLE_ID = process.env.POSITIONS_TABLE_ID
  ? `${PROJECT_ID}.${DATASET_ID}.${process.env.POSITIONS_TABLE_ID}`
  : '';
export const MINTS_BURNS_TABLE_ID = process.env.MINTS_BURNS_TABLE_ID
  ? `${PROJECT_ID}.${DATASET_ID}.${process.env.MINTS_BURNS_TABLE_ID}`
  : '';

export const LAST_PROCESSED_BLOCK_TABLE_ID = process.env.LAST_PROCESSED_BLOCK_TABLE_ID
? `${PROJECT_ID}.${DATASET_ID}.${process.env.LAST_PROCESSED_BLOCK_TABLE_ID}`
: '';

export const LP_PROCESSING_WINDOW: { [chainId: number]: number } = {
  1: 24 * 300,
  42161: 340000,
};

export const SECONDS_IN_YEAR = 31_536_000;

// todo: remove this when QA over
export const isTestingAccount = (address: string): boolean => {
  const testingAccounts = [
    '0xb527e950fc7c4f581160768f48b3bfa66a7de1f0',
    '0xF8F6B70a36f4398f0853a311dC6699Aba8333Cc1',
    '0x0960Da039bb8151cacfeF620476e8bAf34Bd9565',
    '0x8DC15493a8041f059f18ddBA98ee7dcf93b838Ad',
    '0xbea9419e51bbd1b7f564c9f0891187a5822974ab',
    '0xFD4295c1A0b07e6b706f0Ab83dC9eB461b7f17B3',
  ];

  return testingAccounts.map((item) => item.toLowerCase()).includes(address.toLowerCase());
};
