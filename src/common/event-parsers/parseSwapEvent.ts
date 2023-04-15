import { AMM } from '@voltz-protocol/v1-sdk';
import { ethers } from 'ethers';

import { ExtendedEvent } from '../types';

export type SwapEventInfo = {
  eventId: string;
  eventBlockNumber: number;

  chainId: number;
  vammAddress: string;
  ownerAddress: string;
  tickLower: number;
  tickUpper: number;

  variableTokenDelta: number;
  fixedTokenDeltaUnbalanced: number;
  feePaidToLps: number;

  rateOracle: string;
  underlyingToken: string;
  marginEngineAddress: string;
  amm: AMM;
  type: string;
  eventTimestamp: number;
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

  const amm = event.amm;

  return {
    eventId: eventId.toLowerCase(),
    eventBlockNumber: event.blockNumber,
    chainId: event.chainId,
    vammAddress: event.amm.id.toLowerCase(),
    ownerAddress: ownerAddress.toLowerCase(),
    tickLower,
    tickUpper,
    variableTokenDelta,
    fixedTokenDeltaUnbalanced,
    feePaidToLps: cumulativeFeeIncurred,
    rateOracle: event.amm.rateOracle.protocol,
    underlyingToken: event.amm.underlyingToken.name,
    marginEngineAddress: event.amm.marginEngineAddress,
    amm,
    type: event.type,
    eventTimestamp: event.timestamp
  };
};
