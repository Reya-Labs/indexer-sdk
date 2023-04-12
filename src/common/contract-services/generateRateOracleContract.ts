import { ethers } from 'ethers';

export const generateRateOracleContract = (
  address: string,
  provider: ethers.providers.Provider,
): ethers.Contract => {
  const abi = [
    `function variableFactor(uint256 termStartTimestamp, uint256 termEndTimestamp) external returns(uint256 result)`,
  ];

  const contract = new ethers.Contract(address, abi, provider);

  return contract;
};
