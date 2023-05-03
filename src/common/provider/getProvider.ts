import { ethers } from 'ethers';

import { ALCHEMY_API_KEY } from '../constants';

enum SupportedChainId {
  mainnet = 1,
  goerli = 5,
  arbitrum = 42161,
  arbitrumGoerli = 421613,
}

const alchemyApiKeyToURL = (chainId: SupportedChainId, apiKey: string): string => {
  switch (chainId) {
    case SupportedChainId.mainnet: {
      return `https://eth-mainnet.g.alchemy.com/v2/${apiKey}`;
    }
    case SupportedChainId.goerli: {
      return `https://eth-goerli.g.alchemy.com/v2/${apiKey}`;
    }
    case SupportedChainId.arbitrum: {
      return `https://arb-mainnet.g.alchemy.com/v2/${apiKey}`;
    }
    case SupportedChainId.arbitrumGoerli: {
      return `https://arb-goerli.g.alchemy.com/v2/${apiKey}`;
    }
  }
};

export const getProvider = (chainId: SupportedChainId): ethers.providers.JsonRpcProvider => {
  const providerURL = alchemyApiKeyToURL(chainId, ALCHEMY_API_KEY);
  return new ethers.providers.JsonRpcProvider(providerURL);
};
