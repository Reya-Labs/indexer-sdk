/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import axios from "axios";

const getETHPriceInUSD = async (): Promise<number> => {
    const apiKey = process.env.COINGECKO_API_KEY;

    if (!apiKey) {
        throw new Error(`Coingecko API key is not provided.`);
    }

    try {
      const data = await axios.get(`https://pro-api.coingecko.com/api/v3/simple/price?x_cg_pro_api_key=${apiKey}&ids=ethereum&vs_currencies=usd`);

      const price = data.data.ethereum.usd as number;
  
      return price;
    } catch (_) {}
  
    return 0;
  };

export const getTokenPriceInUSD = async (caseSensitiveTokenName: string): Promise<number> => {
    const tokenName = caseSensitiveTokenName.toUpperCase();

    switch (tokenName) {
        case 'USDC': 
        case 'DAI':
        case 'USDT':
        case 'VUSD':
        {
            return 1;
        }
        case 'ETH': {
            return getETHPriceInUSD();
        }
        default: {
            return 0;
        }
    }
}