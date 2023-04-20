import * as dotenv from 'dotenv';

dotenv.config();

export const SECONDS_IN_YEAR = 31_536_000;

// timestamp of active VAMM
export const APR_2023_TIMESTAMP = 1680337863;

// scale and precision of number in Big Query
export const PRECISION = 18;
export const SCALE = 9;

// CoinGecko API key
export const GECKO_KEY = process.env.COINGECKO_API_KEY || '';

// BigQuery project and dataset IDs
export const PROJECT_ID = 'risk-monitoring-361911';
export const DATASET_ID = 'voltz_v1_positions';

// Names of all BigQuery tables
const getTableID = (tableName: string) => {
  if (tableName.length === 0) {
    throw new Error('Table name is not specified');
  }

  return `${PROJECT_ID}.${DATASET_ID}.${tableName}`;
};

// Active Swaps Table Name and ID
export const ACTIVE_SWAPS_TABLE_NAME = process.env.ACTIVE_SWAPS_TABLE_ID || '';
export const ACTIVE_SWAPS_TABLE_ID = getTableID(ACTIVE_SWAPS_TABLE_NAME);

// Mints and Burns Table Name and ID
export const MINTS_BURNS_TABLE_NAME = process.env.MINTS_BURNS_TABLE_ID || '';
export const MINTS_BURNS_TABLE_ID = getTableID(MINTS_BURNS_TABLE_NAME);

// Positions Table Name and ID
export const POSITIONS_TABLE_NAME = process.env.POSITIONS_TABLE_ID || '';
export const POSITIONS_TABLE_ID = getTableID(POSITIONS_TABLE_NAME);

// LP processing block windows
export const LP_PROCESSING_WINDOW: { [chainId: number]: number } = {
  1: 24 * 300,
  42161: 340000,
};

// Cache set window in seconds
export const CACHE_SET_WINDOW: { [chainId: number]: number } = {
  1: 24 * 60,
  42161: 68000,
};

export const REDISHOST = process.env.REDISHOST || 'localhost';
export const REDISPORT: number = Number(process.env.REDISPORT) || 6379;

export const ALCHEMY_API_KEY = process.env.ALCHEMY_KEY || '';

// Testing accounts (todo: remove this when QA over)
export const isTestingAccount = (address: string): boolean => {
  const testingAccounts = [
    '0xb527e950fc7c4f581160768f48b3bfa66a7de1f0',
    // '0xF8F6B70a36f4398f0853a311dC6699Aba8333Cc1',
    // '0x0960Da039bb8151cacfeF620476e8bAf34Bd9565',
    // '0x8DC15493a8041f059f18ddBA98ee7dcf93b838Ad',
    // '0xbea9419e51bbd1b7f564c9f0891187a5822974ab',
    // '0xFD4295c1A0b07e6b706f0Ab83dC9eB461b7f17B3',
  ];

  return testingAccounts.map((item) => item.toLowerCase()).includes(address.toLowerCase());
};
