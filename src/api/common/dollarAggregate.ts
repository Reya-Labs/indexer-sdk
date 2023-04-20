/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import axios from 'axios';

export const getCurrentEthER = async (geckoKey: string): Promise<number> => {
  const data = await axios.get(`
    https://pro-api.coingecko.com/api/v3/simple/price?x_cg_pro_api_key=${geckoKey}&ids=ethereum&vs_currencies=usd
    `);

  try {
    return Number(data.data.ethereum.usd);
  } catch (error) {
    console.log(`Failed to fetch ETH price with message ${(error as Error).message}`);
    return 0;
  }
};

export async function dollarAggregate(
  rows: {
    amount: number;
    underlyingToken: string;
  }[],
  geckoKey: string,
) {
  const ethToUsdER = await getCurrentEthER(geckoKey);

  const totalInUSD = rows.reduce((total, { amount, underlyingToken }) => {
    if (underlyingToken.startsWith('0x')) {
      throw new Error('Underlying token is passed as address');
    }

    if (underlyingToken === 'ETH') {
      return total + amount * ethToUsdER;
    }

    return total + amount;
  }, 0);

  return totalInUSD;
}
