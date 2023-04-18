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
  let totalInDollars = 0;

  for (const { amount, underlyingToken } of rows) {
    let amountInDollars = Number(amount.toString());

    if (
      underlyingToken === '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2' ||
      underlyingToken === 'ETH'
    ) {
      const ethToUsdER = await getCurrentEthER(geckoKey);
      amountInDollars = amountInDollars * ethToUsdER;
    }

    totalInDollars += amountInDollars;
  }

  return totalInDollars;
}
