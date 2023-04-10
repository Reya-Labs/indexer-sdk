/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/no-unused-vars */

import { AMM } from '@voltz-protocol/v1-sdk';
import { BigNumber } from 'ethers';

const variableFactor = async (
  fromInMS: number,
  toInMS: number,
): Promise<{
  scaled: number;
  wad: BigNumber;
}> => {
  return {
    scaled: 0.03,
    wad: BigNumber.from(10).pow(16).mul(3),
  };
};

export const mockedAMM = {
  id: 'AMM-Test',
  underlyingToken: {
    id: 'token',
    decimals: 18,
  },
  rateOracle: {
    id: 'rate-oracle',
    protocolId: 1,
  },
  marginEngineAddress: 'margin-engine',
  variableFactor,
} as unknown as AMM;