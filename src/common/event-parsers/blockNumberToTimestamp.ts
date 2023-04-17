import { ethers } from "ethers"


export const blockNumberToTimestamp = async (chainId: number, blockNumber: number) => { 

    // todo: needs testing and check if we can speed it up by using approximations

    let  provider = new ethers.providers.JsonRpcProvider(`https://arb-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_KEY}`); 

    if (chainId === 1) {
        provider = new ethers.providers.JsonRpcProvider(`https://eth-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_KEY}`); 
    }

    const eventTimestamp = (await provider.getBlock(blockNumber)).timestamp;

    return eventTimestamp;

}