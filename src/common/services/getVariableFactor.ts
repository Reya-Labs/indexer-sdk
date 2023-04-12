import { ethers } from 'ethers';

import { generateRateOracleContract } from '../contract-services/generateRateOracleContract';

export const getVariableFactor = async (
  provider: ethers.providers.Provider,
  rateOracleId: string,
  from: number, // in seconds
  to: number, // in seconds
  blockTag: number,
): Promise<number> => {
  const rateOracleContract = generateRateOracleContract(rateOracleId, provider);

  const fromWad = ethers.utils.parseUnits(from.toString(), 18);
  const toWad = ethers.utils.parseUnits(to.toString(), 18);

  const variableFactorWad = (await rateOracleContract.callStatic.variableFactor(fromWad, toWad, {
    blockTag,
  })) as ethers.BigNumber;

  const variableFactor = Number(ethers.utils.formatUnits(variableFactorWad, 18));

  return variableFactor;
};
