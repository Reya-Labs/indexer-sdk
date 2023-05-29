
export enum SupportedChainId {
    mainnet = 1,
    goerli = 5,
    arbitrum = 42161,
    arbitrumGoerli = 421613,
    avalanche = 43114,
    avalancheFuji = 43113,
  }

export const getSubgraphURL = (chainId: SupportedChainId): string => {
  switch (chainId) {
    case SupportedChainId.mainnet: {
      return 'https://api.thegraph.com/subgraphs/name/voltzprotocol/mainnet-v1';
    }
    case SupportedChainId.goerli: {
      return 'https://api.thegraph.com/subgraphs/name/voltzprotocol/voltz-goerli';
    }
    case SupportedChainId.arbitrum: {
      return 'https://api.thegraph.com/subgraphs/name/voltzprotocol/arbitrum-v1';
    }
    case SupportedChainId.arbitrumGoerli: {
      return 'https://api.thegraph.com/subgraphs/name/voltzprotocol/arbitrum-goerli-v1';
    }
    case SupportedChainId.avalanche: {
      return 'https://api.thegraph.com/subgraphs/name/voltzprotocol/avalanche-v1';
    }
    case SupportedChainId.avalancheFuji: {
      return 'https://api.thegraph.com/subgraphs/name/voltzprotocol/ava-fuji-v1';
    }
  }
};
