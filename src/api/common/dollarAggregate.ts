import axios from 'axios';

export const getCurrentEthER = async (geckoKey: string): Promise<number> => {
  const data = await axios.get(`
    https://pro-api.coingecko.com/api/v3/simple/price?x_cg_pro_api_key=${geckoKey}&ids=ethereum&vs_currencies=usd
    `);

  return Number(data.data.ethereum.usd);
};

export async function dollarAggregate(rows: any, geckoKey: string) {
  let totalInDollars = 0;

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    let amountInDollars = Number(row.amount.toString());

    if (
      row.underlyingToken === '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2' ||
      row.underlyingToken === 'ETH'
    ) {
      const ethToUsdER = await getCurrentEthER(geckoKey);
      amountInDollars = amountInDollars * ethToUsdER;
    }

    totalInDollars += amountInDollars;
  }

  return totalInDollars;
}
