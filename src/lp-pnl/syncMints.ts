
import { BigQuery } from '@google-cloud/bigquery';
import { AMM } from '@voltz-protocol/v1-sdk';
import { getPreviousMintEvents } from '../common/swaps/getPreviousSwapEvents';


export const syncPassiveSwaps = async (
    bigQuery: BigQuery,
    amms: AMM[],
    previousBlockNumber: number,
  ): Promise<number> => {


}