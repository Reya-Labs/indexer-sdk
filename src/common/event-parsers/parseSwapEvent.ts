import { AMM } from '@voltz-protocol/v1-sdk';
import { ethers } from 'ethers';

import { SwapEventInfo } from './types';

export const parseSwapEvent = (event: ethers.Event, amm: AMM, chainId: number): SwapEventInfo => {
  const eventId = `${event.blockHash}_${event.transactionHash}_${event.logIndex}`;

  const ownerAddress = event.args?.recipient as string;
  const tickLower = event.args?.tickLower as number;
  const tickUpper = event.args?.tickUpper as number;

  const tokenDecimals = amm.underlyingToken.decimals;

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
    ...event,
    eventId: eventId.toLowerCase(),
    type: 'swap',

    chainId: chainId,
    vammAddress: amm.id.toLowerCase(),
    amm,

    rateOracle: amm.rateOracle.protocol,
    underlyingToken: amm.underlyingToken.name,
    marginEngineAddress: amm.marginEngineAddress,

    ownerAddress: ownerAddress.toLowerCase(),
    tickLower,
    tickUpper,

    variableTokenDelta,
    fixedTokenDeltaUnbalanced,
    feePaidToLps,
  };
};
