import { AMM, getNotionalFromLiquidity } from '@voltz-protocol/v1-sdk';
import { BigNumber, ethers } from 'ethers';

export type MintOrBurnEventInfo = {
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

export const parseMintOrBurnEvent = (chainId: number, amm: AMM, event: ethers.Event, isBurn: boolean): MintOrBurnEventInfo => {
  const tokenDecimals = amm.underlyingToken.decimals;
  const ownerAddress = event.args?.owner as string;
  const tickLower = event.args?.tickLower as number;
  const tickUpper = event.args?.tickUpper as number;
  const amount = event.args?.amount as BigNumber;

  let notionalLiquidityProvided = getNotionalFromLiquidity(
    amount,
    tickLower,
    tickUpper,
    tokenDecimals,
  );

  if (isBurn) {
    notionalLiquidityProvided =  -1.0 * notionalLiquidityProvided;
  }

  return {
    chainId,
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
