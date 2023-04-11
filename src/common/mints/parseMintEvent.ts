import { AMM, getNotionalFromLiquidity } from '@voltz-protocol/v1-sdk';
import { BigNumber, ethers } from 'ethers';

import { CHAIN_ID } from '..';

export type MintEventInfo = {
  chainId: number;
  vammAddress: string;
  ownerAddress: string;
  tickLower: number;
  tickUpper: number;
  notionalLiquidityProvided: number;
  rateOracle: string;
  underlyingToken: string;
  marginEngineAddress: string;
};

export const parseMintEvent = (amm: AMM, event: ethers.Event): MintEventInfo => {
  const tokenDecimals = amm.underlyingToken.decimals;
  const ownerAddress = event.args?.owner as string;
  const tickLower = event.args?.tickLower as number;
  const tickUpper = event.args?.tickUpper as number;
  const amount = event.args?.amount as BigNumber;

  const notionalLiquidityProvided = getNotionalFromLiquidity(
    amount,
    tickLower,
    tickUpper,
    tokenDecimals,
  );

  return {
    chainId: CHAIN_ID,
    vammAddress: amm.id.toLowerCase(),
    ownerAddress: ownerAddress.toLowerCase(),
    tickLower,
    tickUpper,
    notionalLiquidityProvided,
    rateOracle: amm.rateOracle.id,
    underlyingToken: amm.underlyingToken.id,
    marginEngineAddress: amm.marginEngineAddress,
  };
};
