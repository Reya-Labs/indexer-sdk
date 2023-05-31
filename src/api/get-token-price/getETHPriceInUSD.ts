/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import axios from 'axios';

const refreshIntervalInMS = 60 * 1000;

let price: number | null = null;
let lastRefreshInMs = 0;

export const getETHPriceInUSD = async (): Promise<number> => {
  if (price && lastRefreshInMs + refreshIntervalInMS > Date.now().valueOf()) {
    return price;
  }

  const apiKey = process.env.COINGECKO_API_KEY;

  if (!apiKey) {
    throw new Error(`Coingecko API key is not provided.`);
  }

  try {
    console.log('Fetching ETH price...');
    const data = await axios.get(
      `https://pro-api.coingecko.com/api/v3/simple/price?x_cg_pro_api_key=${apiKey}&ids=ethereum&vs_currencies=usd`,
    );

    price = data.data.ethereum.usd as number;
    lastRefreshInMs = Date.now().valueOf();

    return price;
  } catch (_) {}

  return 0;
};
