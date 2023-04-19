import { ethers } from 'ethers';

import { ExtendedEvent } from '../types';
import { SwapEventInfo } from './types';

export const parseSwapEvent = (event: ExtendedEvent): SwapEventInfo => {
  const eventId = `${event.blockHash}_${event.transactionHash}_${event.logIndex}`;

  const ownerAddress = event.args?.recipient as string;
  const tickLower = event.args?.tickLower as number;
  const tickUpper = event.args?.tickUpper as number;

  const tokenDecimals = event.amm.underlyingToken.decimals;

  const variableTokenDelta = Number(
    ethers.utils.formatUnits(event.args?.variableTokenDelta as ethers.BigNumber, tokenDecimals),
  );
  const fixedTokenDeltaUnbalanced = Number(
    ethers.utils.formatUnits(
      event.args?.fixedTokenDeltaUnbalanced as ethers.BigNumber,
      tokenDecimals,
    ),
  );
  const feePaidToLps = Number(
    ethers.utils.formatUnits(event.args?.cumulativeFeeIncurred as ethers.BigNumber, tokenDecimals),
  );

  return {
    eventId: eventId.toLowerCase(),
    type: event.type,
    eventBlockNumber: event.blockNumber,

    chainId: event.chainId,
    vammAddress: event.amm.id.toLowerCase(),
    amm: event.amm,

    rateOracle: event.amm.rateOracle.protocol,
    underlyingToken: event.amm.underlyingToken.name,
    marginEngineAddress: event.amm.marginEngineAddress,

    ownerAddress: ownerAddress.toLowerCase(),
    tickLower,
    tickUpper,

    variableTokenDelta,
    fixedTokenDeltaUnbalanced,
    feePaidToLps,
  };
};
