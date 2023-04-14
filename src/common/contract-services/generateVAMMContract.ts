import { ethers } from 'ethers';

export const generateVAMMContract = (
  address: string,
  provider: ethers.providers.Provider,
): ethers.Contract => {
  const abi = [
    `
      event Swap(address sender, address indexed recipient, int24 indexed tickLower,int24 indexed tickUpper, int256 desiredNotional, uint160 sqrtPriceLimitX96,uint256 cumulativeFeeIncurred, int256 fixedTokenDelta, int256 variableTokenDelta,int256 fixedTokenDeltaUnbalanced)
      `,
    `
      event Mint(address sender, address indexed owner, int24 indexed tickLower, int24 indexed tickUpper, uint128 amount)
      `,
    `
    event Burn(address sender, address indexed owner, int24 indexed tickLower, int24 indexed tickUpper, uint128 amount)
    `,
  ];

  const contract = new ethers.Contract(address, abi, provider);

  return contract;
};
