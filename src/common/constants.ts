import * as dotenv from 'dotenv';

dotenv.config();

export const APR_2023_TIMESTAMP = 1680337863;

export const PROJECT_ID = 'risk-monitoring-361911';
export const DATASET_ID = 'voltz_v1_positions';
export const SWAPS_TABLE_ID = process.env.SWAPS_TABLE_ID  ? `${PROJECT_ID}.${DATASET_ID}.${process.env.SWAPS_TABLE_ID}` : '';
export const POSITIONS_TABLE_ID = process.env.POSITIONS_TABLE_ID ? `${PROJECT_ID}.${DATASET_ID}.${process.env.POSITIONS_TABLE_ID}` : '';
export const MINTS_BURNS_TABLE_ID = process.env.MINTS_BURNS_TABLE_ID ? `${PROJECT_ID}.${DATASET_ID}.${process.env.MINTS_BURNS_TABLE_ID}` : '';

export const LP_PROCESSING_WINDOW: { [chainId: number]: number } = {
  1: 7200,
  42161: 340000,
};
