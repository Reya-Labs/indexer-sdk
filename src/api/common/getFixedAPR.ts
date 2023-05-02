/* eslint-disable @typescript-eslint/no-unsafe-call */

import { BigNumber } from 'ethers';

import { generateVAMMContract } from '../../common/contract-services/generateVAMMContract';
import { getProvider } from '../../common/provider/getProvider';
import { tickToFixedRate } from '../../common/services/tickConversions';

export const getFixedApr = async (chainId: number, vammAddress: string): Promise<number> => {
  const provider = getProvider(chainId);
  const vammContract = generateVAMMContract(vammAddress, provider);

  const currentTick = ((await vammContract.vammVars()) as [BigNumber, number, number])[1];
  const apr = tickToFixedRate(currentTick);

  return apr;
};
