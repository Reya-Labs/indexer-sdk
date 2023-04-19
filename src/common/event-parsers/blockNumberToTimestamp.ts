import { ethers } from 'ethers';

export const blockNumberToTimestamp = async (provider: ethers.providers.JsonRpcProvider, blockNumber: number) => {
  // todo: needs testing and check if we can speed it up by using approximations

  const eventTimestamp = (await provider.getBlock(blockNumber)).timestamp;

  return eventTimestamp;
};
