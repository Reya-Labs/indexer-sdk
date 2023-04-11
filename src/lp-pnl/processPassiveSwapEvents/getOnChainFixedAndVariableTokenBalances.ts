import { ethers } from 'ethers';

type Args = {
  marginEngineContract: ethers.Contract;
  ownerAddress: string;
  tickLower: number;
  tickUpper: number;
  tokenDecimals: number;
  blockNumber: number;
};

export const getOnChainFixedAndVariableTokenBalances = async ({
  marginEngineContract,
  ownerAddress,
  tickLower,
  tickUpper,
  tokenDecimals,
  blockNumber,
}: Args): Promise<{
  onChainVariableTokenBalance: number;
  onChainFixedTokenBalance: number;
}> => {
  const position = (await marginEngineContract.callStatic.getPosition(
    ownerAddress,
    tickLower,
    tickUpper,
    { blockTag: blockNumber },
  )) as {
    fixedTokenBalance: ethers.BigNumber;
    variableTokenBalance: ethers.BigNumber;
  };

  const onChainFixedTokenBalance = Number(
    ethers.utils.formatUnits(position.fixedTokenBalance, tokenDecimals),
  );
  const onChainVariableTokenBalance = Number(
    ethers.utils.formatUnits(position.fixedTokenBalance, tokenDecimals),
  );

  return { onChainVariableTokenBalance, onChainFixedTokenBalance };
};
