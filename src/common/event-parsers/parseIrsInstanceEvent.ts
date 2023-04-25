import { BigNumber, ethers } from 'ethers';

import { IrsInstanceEventInfo } from './types';

export const parseIrsInstanceEvent = (
  event: ethers.Event,
  chainId: number,
): IrsInstanceEventInfo => {
  const eventId = `${event.blockHash}_${event.transactionHash}_${event.logIndex}`;

  const underlyingToken = event.args?.underlyingToken as string;
  const rateOracleID = event.args?.rateOracle as string;
  const termStartTimestampWad = event.args?.termStartTimestampWad as BigNumber;
  const termEndTimestampWad = event.args?.termEndTimestampWad as BigNumber;
  const marginEngine = event.args?.marginEngine as string;
  const vamm = event.args?.vamm as string;
  const rateOracleIndex = event.args?.yieldBearingProtocolID as number;
  const tokenDecimals = event.args?.underlyingTokenDecimals as number;

  const termStartTimestamp = Number(ethers.utils.formatUnits(termStartTimestampWad, tokenDecimals));
  const termEndTimestamp = Number(ethers.utils.formatUnits(termEndTimestampWad, tokenDecimals));

  return {
    ...event,
    eventId: eventId.toLowerCase(),
    type: 'irs_pool_deployment',

    chainId,
    factory: event.address,

    vamm,
    marginEngine,

    termStartTimestamp,
    termEndTimestamp,

    rateOracleID,
    rateOracleIndex,

    underlyingToken,
    tokenDecimals,
  };
};
