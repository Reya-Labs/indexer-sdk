import { BigNumber, ethers } from 'ethers';

import { generateMarginEngineContract } from '../../common/generateMarginEngineContract';

export type GetOnChainFixedAndVariableTokenBalancesArgs = {
  marginEngineAddress: string;
  ownerAddress: string;
  tickLower: number;
  tickUpper: number;
  tokenDecimals: number;
  blockNumber: number;
  provider: ethers.providers.Provider;
};

export type GetOnChainFixedAndVariableTokenBalancesReturn = {
  onChainVariableTokenBalance: number;
  onChainFixedTokenBalance: number;
};

export const getOnChainFixedAndVariableTokenBalances = async ({
  marginEngineAddress,
  ownerAddress,
  tickLower,
  tickUpper,
  tokenDecimals,
  blockNumber,
  provider,
}: GetOnChainFixedAndVariableTokenBalancesArgs): Promise<GetOnChainFixedAndVariableTokenBalancesReturn> => {
  const marginEngineContract = generateMarginEngineContract(marginEngineAddress, provider);

  const position = (await marginEngineContract.callStatic.getPosition(
    ownerAddress,
    tickLower,
    tickUpper,
    { blockTag: blockNumber },
  )) as {
    fixedTokenBalance: BigNumber;
    variableTokenBalance: BigNumber;
  };

  const onChainFixedTokenBalance = Number(
    ethers.utils.formatUnits(position.fixedTokenBalance, tokenDecimals),
  );
  const onChainVariableTokenBalance = Number(
    ethers.utils.formatUnits(position.fixedTokenBalance, tokenDecimals),
  );

  return { onChainVariableTokenBalance, onChainFixedTokenBalance };
};
