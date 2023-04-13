import { AMM } from '@voltz-protocol/v1-sdk';
import { ethers } from 'ethers';

import { getFixedRateLocked } from '..';
import { ExtendedEvent } from '../types';

export type SwapEventInfo = {
  // todo: we should store the event timestamp in this object
  eventId: string;
  eventBlockNumber: number;

  chainId: number;
  vammAddress: string;
  ownerAddress: string;
  tickLower: number;
  tickUpper: number;

  notionalLocked: number;
  fixedRateLocked: number;
  feePaidToLps: number;

  rateOracle: string;
  underlyingToken: string;
  marginEngineAddress: string;
};

export const parseSwapEvent = (event: ExtendedEvent): SwapEventInfo => {
  const eventId = `${event.blockHash}_${event.transactionHash}_${event.logIndex}`;

  const tokenDecimals = event.amm.underlyingToken.decimals;

  const ownerAddress = event.args?.recipient as string;
  const tickLower = event.args?.tickLower as number;
  const tickUpper = event.args?.tickUpper as number;

  const variableTokenDelta = Number(
    ethers.utils.formatUnits(event.args?.variableTokenDelta as ethers.BigNumber, tokenDecimals),
  );
  const fixedTokenDeltaUnbalanced = Number(
    ethers.utils.formatUnits(
      event.args?.fixedTokenDeltaUnbalanced as ethers.BigNumber,
      tokenDecimals,
    ),
  );
  const cumulativeFeeIncurred = Number(
    ethers.utils.formatUnits(event.args?.cumulativeFeeIncurred as ethers.BigNumber, tokenDecimals),
  );

  return {
    eventId: eventId.toLowerCase(),
    eventBlockNumber: event.blockNumber,
    chainId: event.chainId,
    vammAddress: event.amm.id.toLowerCase(),
    ownerAddress: ownerAddress.toLowerCase(),
    tickLower,
    tickUpper,
    notionalLocked: variableTokenDelta,
    fixedRateLocked: getFixedRateLocked(variableTokenDelta, fixedTokenDeltaUnbalanced),
    feePaidToLps: cumulativeFeeIncurred,
    rateOracle: event.amm.rateOracle.id,
    underlyingToken: event.amm.underlyingToken.id,
    marginEngineAddress: event.amm.marginEngineAddress,
  };
};
