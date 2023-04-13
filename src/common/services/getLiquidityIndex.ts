/* eslint-disable @typescript-eslint/no-unsafe-call */

import { ethers } from 'ethers';

import { generateMarginEngineContract } from '../contract-services/generateMarginEngineContract';
import { generateRateOracleContract } from '../contract-services/generateRateOracleContract';

const getAaveLendingLiquidityIndex = async (
  provider: ethers.providers.Provider,
  rateOracleId: string,
  blockTag: number,
): Promise<number> => {
  const rateOracleContract = generateRateOracleContract(rateOracleId, provider);

  const aaveLendingPoolABI = [
    `function getReserveNormalizedIncome(address underlyingAsset) external view returns (uint256)`,
  ];
  const aaveLendingPoolAddress = (await rateOracleContract.aaveLendingPool()) as string;

  console.log('lending pool:', aaveLendingPoolAddress);

  const aaveLendingPoolContract = new ethers.Contract(
    aaveLendingPoolAddress,
    aaveLendingPoolABI,
    provider,
  );
  
  const token = (await rateOracleContract.underlying()) as string;

  const liquidityIndexRay = (await aaveLendingPoolContract.getReserveNormalizedIncome(token, {
    blockTag,
  })) as ethers.BigNumber;

  const liquidityIndex = Number(ethers.utils.formatUnits(liquidityIndexRay, 27));

  console.log(`Special case(Aave): liquidity index: ${liquidityIndex}`);
  return liquidityIndex;
};

const getCompoundLendingLiquidityIndex = async (
  provider: ethers.providers.Provider,
  rateOracleId: string,
  blockTag: number,
): Promise<number> => {
  const rateOracleContract = generateRateOracleContract(rateOracleId, provider);

  console.log('Fetching Compound LI');

  const cTokenABI = [`function exchangeRateStored() external view returns (uint256)`];
  const cTokenAddress = (await rateOracleContract.cToken()) as string;

  console.log(`Ctoken address fetched: ${cTokenAddress}`);

  const cTokenContract = new ethers.Contract(cTokenAddress, cTokenABI, provider);

  const liquidityIndexRay = (await cTokenContract.exchangeRateStored({blockTag})) as ethers.BigNumber;

  console.log(`raw li fetched: ${liquidityIndexRay.toString()}`);

  // todo: 28 is for DAI, generalise for all tokens
  const liquidityIndex = Number(ethers.utils.formatUnits(liquidityIndexRay, 28));

  console.log(`Special case(Compound): liquidity index: ${liquidityIndex}`);
  return liquidityIndex;
};

export const getLiquidityIndex = async (
  chainId: number,
  provider: ethers.providers.Provider,
  marginEngineAddress: string,
  blockTag: number,
): Promise<number> => {
  console.log(`Fetching normal LI with marginEngineAddress: ${marginEngineAddress}`);

  const marginEngineContract = generateMarginEngineContract(marginEngineAddress, provider);
  // const rateOracleId = (await marginEngineContract.rateOracle({
  //   blockTag,
  // })) as string;
  const rateOracleId = (await marginEngineContract.rateOracle()) as string;

  console.log('here?', rateOracleId);

  // Check for inconsistent rate oracles
  if (
    chainId === 1 &&
    rateOracleId.toLowerCase() === '0x9f30Ec6903F1728ca250f48f664e48c3f15038eD'.toLowerCase()
  ) {
    return getAaveLendingLiquidityIndex(provider, rateOracleId, blockTag);
  }

  if (
    chainId === 1 &&
    rateOracleId.toLowerCase() === '0x65F5139977C608C6C2640c088D7fD07fA17A0614'.toLowerCase()
  ) {
    console.log('here?');
    return getAaveLendingLiquidityIndex(provider, rateOracleId, blockTag);
  }

  if (
    chainId === 1 &&
    rateOracleId.toLowerCase() === '0x919674d599D8df8dd9E7Ebaabfc2881089C5D91C'.toLowerCase()
  ) {
    return getCompoundLendingLiquidityIndex(provider, rateOracleId, blockTag);
  }
  //

  const rateOracleContract = generateRateOracleContract(rateOracleId, provider);

  const liquidityIndexRay = (await rateOracleContract.getCurrentRateInRay({
    blockTag,
  })) as ethers.BigNumber;

  const liquidityIndex = Number(ethers.utils.formatUnits(liquidityIndexRay, 27));

  console.log(`Liquidity index at block ${blockTag} is: ${liquidityIndex}`);

  return liquidityIndex;
};
