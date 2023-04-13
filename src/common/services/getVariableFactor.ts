/* eslint-disable @typescript-eslint/no-unsafe-call */

import { ethers } from 'ethers';

import { generateMarginEngineContract } from '../contract-services/generateMarginEngineContract';
import { generateRateOracleContract } from '../contract-services/generateRateOracleContract';

export const getVariableFactor = async (
  provider: ethers.providers.Provider,
  marginEngineAddress: string,
  from: number, // in seconds
  to: number, // in seconds
  blockTag: number,
): Promise<number> => {
  const marginEngineContract = generateMarginEngineContract(marginEngineAddress, provider);
  const rateOracleId = (await marginEngineContract.rateOracle()) as string;

  const rateOracleContract = generateRateOracleContract(rateOracleId, provider);

  const fromWad = ethers.utils.parseUnits(from.toString(), 18);
  const toWad = ethers.utils.parseUnits(to.toString(), 18);

  const variableFactorWad = (await rateOracleContract.callStatic.variableFactor(fromWad, toWad, {
      blockTag,
    })) as ethers.BigNumber;

  const variableFactor = Number(ethers.utils.formatUnits(variableFactorWad, 18));

  return variableFactor;
};
