import * as dotenv from 'dotenv';
import { ethers } from 'ethers';

dotenv.config();

export const APR_2023_TIMESTAMP = 1680337863;

export const MIN_ETH_NOTIONAL = 0;
export const MIN_USD_NOTIONAL = 0;

export const PROJECT_ID = 'risk-monitoring-361911';
export const DATASET_ID = 'voltz_v1_positions';

export const SWAPS_TABLE_ID = process.env.SWAPS_TABLE_ID || '';
export const POSITIONS_TABLE_ID = process.env.POSITIONS_TABLE_ID || '';

export const WAD = ethers.BigNumber.from(10).pow(18);
