import cors from 'cors';
import express from 'express';

import { getChainTradingVolume } from '../big-query-support/active-swaps-table/pull-data/getTradingVolume';
import { getFixedRates } from '../big-query-support/historical-rates/pull-data/getFixedRates';
import { getVariableRates } from '../big-query-support/historical-rates/pull-data/getVariableRates';
import { getChainTotalLiquidity } from '../big-query-support/mints-and-burns-table/pull-data/getTotalLiquidity';
import { pullAllChainPools } from '../big-query-support/pools-table/pull-data/pullAllChainPools';
import { pullExistingPoolRow } from '../big-query-support/pools-table/pull-data/pullExistingPoolRow';
import { pullExistingPositionRow } from '../big-query-support/positions-table/pull-data/pullExistingPositionRow';
import { SECONDS_IN_YEAR } from '../common/constants';
import { getCurrentTick } from '../common/contract-services/getCurrentTick';
import { getProvider } from '../common/provider/getProvider';
import { getLiquidityIndex } from '../common/services/getLiquidityIndex';
import { tickToFixedRate } from '../common/services/tickConversions';
import { getBlockAtTimestamp, getTimeInYearsBetweenTimestamps } from '../common/utils';
import { getAmm } from './common/getAMM';
import axios from 'axios';

export const app = express();

app.use(cors());

const trustedProxies = ['34.80.0.0/15', '34.137.0.0/16', '35.185.128.0/19', '35.185.160.0/20', '35.187.144.0/20', '35.189.160.0/19', '35.194.128.0/17', '35.201.128.0/17', '35.206.192.0/18', '35.220.32.0/21', '35.221.128.0/17', '35.229.128.0/17', '35.234.0.0/18', '35.235.16.0/20', '35.236.128.0/18', '35.242.32.0/21', '104.155.192.0/19', '104.155.224.0/20', '104.199.128.0/18', '104.199.192.0/19', '104.199.224.0/20', '104.199.242.0/23', '104.199.244.0/22', '104.199.248.0/21', '107.167.176.0/20', '130.211.240.0/20', '2600:1900:4030::/44', '34.92.0.0/16', '34.96.128.0/17', '34.104.88.0/21', '34.124.24.0/21', '34.150.0.0/17', '35.215.128.0/18', '35.220.27.0/24', '35.220.128.0/17', '35.241.64.0/18', '35.242.27.0/24', '35.243.8.0/21', '2600:1900:41a0::/44', '34.84.0.0/16', '34.85.0.0/17', '34.104.62.0/23', '34.104.128.0/17', '34.127.190.0/23', '34.146.0.0/16', '34.157.64.0/20', '34.157.164.0/22', '34.157.192.0/20', '35.187.192.0/19', '35.189.128.0/19', '35.190.224.0/20', '35.194.96.0/19', '35.200.0.0/17', '35.213.0.0/17', '35.220.56.0/22', '35.221.64.0/18', '35.230.240.0/20', '35.242.56.0/22', '35.243.64.0/18', '104.198.80.0/20', '104.198.112.0/20', '2600:1900:4050::/44', '34.97.0.0/16', '34.104.49.0/24', '34.127.177.0/24', '35.217.128.0/17', '35.220.45.0/24', '35.242.45.0/24', '35.243.56.0/21', '2600:1900:41d0::/44', '34.0.96.0/19', '34.22.64.0/19', '34.22.96.0/20', '34.64.32.0/19', '34.64.64.0/22', '34.64.68.0/22', '34.64.72.0/21', '34.64.80.0/20', '34.64.96.0/19', '34.64.128.0/22', '34.64.132.0/22', '34.64.136.0/21', '34.64.144.0/20', '34.64.160.0/19', '34.64.192.0/18', '35.216.0.0/17', '2600:1901:8180::/44', '34.93.0.0/16', '34.100.128.0/17', '34.104.108.0/23', '34.124.44.0/23', '34.152.64.0/22', '34.157.87.0/24', '34.157.215.0/24', '34.177.32.0/22', '35.200.128.0/17', '35.201.41.0/24', '35.207.192.0/18', '35.220.42.0/24', '35.234.208.0/20', '35.242.42.0/24', '35.244.0.0/18', '2600:1900:40a0::/44', '34.0.0.0/20', '34.104.120.0/23', '34.124.56.0/23', '34.126.208.0/20', '34.131.0.0/16', '2600:1900:41b0::/44', '34.21.128.0/17', '34.87.0.0/17', '34.87.128.0/18', '34.104.58.0/23', '34.104.106.0/23', '34.124.42.0/23', '34.124.128.0/17', '34.126.64.0/18', '34.126.128.0/18', '34.142.128.0/17', '34.143.128.0/17', '34.157.82.0/23', '34.157.88.0/23', '34.157.210.0/23', '35.185.176.0/20', '35.186.144.0/20', '35.187.224.0/19', '35.197.128.0/19', '35.198.192.0/18', '35.213.128.0/18', '35.220.24.0/23', '35.234.192.0/20', '35.240.128.0/17', '35.242.24.0/23', '35.247.128.0/18', '2600:1900:4080::/44', '34.101.18.0/24', '34.101.20.0/22', '34.101.24.0/22', '34.101.32.0/19', '34.101.64.0/18', '34.101.128.0/17', '34.128.64.0/18', '34.152.68.0/24', '34.157.254.0/24', '35.219.0.0/17', '2600:1901:8170::/44', '34.87.192.0/18', '34.104.104.0/23', '34.116.64.0/18', '34.124.40.0/23', '34.151.64.0/18', '34.151.128.0/18', '35.189.0.0/18', '35.197.160.0/19', '35.201.0.0/19', '35.213.192.0/18', '35.220.41.0/24', '35.234.224.0/20', '35.242.41.0/24', '35.244.64.0/18', '2600:1900:40b0::/44', '34.0.16.0/20', '34.104.122.0/23', '34.124.58.0/23', '34.126.192.0/20', '34.129.0.0/16', '2600:1900:41c0::/44', '34.104.116.0/22', '34.116.128.0/17', '34.118.0.0/17', '34.124.52.0/22', '2600:1900:4140::/44', '34.88.0.0/16', '34.104.96.0/21', '34.124.32.0/21', '35.203.232.0/21', '35.217.0.0/18', '35.220.26.0/24', '35.228.0.0/16', '35.242.26.0/24', '2600:1900:4150::/44', '34.0.192.0/19', '34.157.44.0/23', '34.157.172.0/23', '34.164.0.0/16', '34.175.0.0/16', '2600:1901:8100::/44', '8.34.208.0/23', '8.34.211.0/24', '8.34.220.0/22', '23.251.128.0/20', '34.22.112.0/20', '34.22.128.0/17', '34.76.0.0/14', '34.118.254.0/23', '34.140.0.0/16', '35.187.0.0/17', '35.187.160.0/19', '35.189.192.0/18', '35.190.192.0/19', '35.195.0.0/16', '35.205.0.0/16', '35.206.128.0/18', '35.210.0.0/16', '35.220.96.0/19', '35.233.0.0/17', '35.240.0.0/17', '35.241.128.0/17', '35.242.64.0/19', '104.155.0.0/17', '104.199.0.0/18', '104.199.66.0/23', '104.199.68.0/22', '104.199.72.0/21', '104.199.80.0/20', '104.199.96.0/20', '130.211.48.0/20', '130.211.64.0/19', '130.211.96.0/20', '146.148.2.0/23', '146.148.4.0/22', '146.148.8.0/21', '146.148.16.0/20', '146.148.112.0/20', '192.158.28.0/22', '2600:1900:4010::/44', '34.17.0.0/16', '34.157.124.0/23', '34.157.250.0/23', '2600:1901:81b0::/44', '34.89.0.0/17', '34.105.128.0/17', '34.127.186.0/23', '34.142.0.0/17', '34.147.128.0/17', '34.157.36.0/22', '34.157.40.0/22', '34.157.168.0/22', '35.189.64.0/18', '35.197.192.0/18', '35.203.210.0/23', '35.203.212.0/22', '35.203.216.0/22', '35.214.0.0/17', '35.220.20.0/22', '35.230.128.0/19', '35.234.128.0/19', '35.235.48.0/20', '35.242.20.0/22', '35.242.128.0/18', '35.246.0.0/17', '2600:1900:40c0::/44', '34.0.224.0/24', '34.89.128.0/17', '34.104.112.0/23', '34.107.0.0/17', '34.118.244.0/22', '34.124.48.0/23', '34.141.0.0/17', '34.157.48.0/20', '34.157.176.0/20', '34.159.0.0/16', '35.198.64.0/18', '35.198.128.0/18', '35.207.64.0/18', '35.207.128.0/18', '35.220.18.0/23', '35.234.64.0/18', '35.235.32.0/20', '35.242.18.0/23', '35.242.192.0/18', '35.246.128.0/17', '2600:1900:40d0::/44', '34.32.128.0/17', '34.34.0.0/17', '34.90.0.0/15', '34.104.126.0/23', '34.124.62.0/23', '34.141.128.0/17', '34.147.0.0/17', '34.157.80.0/23', '34.157.92.0/22', '34.157.208.0/23', '34.157.220.0/22', '35.204.0.0/16', '35.214.128.0/17', '35.220.16.0/23', '35.234.160.0/20', '35.242.16.0/23', '2600:1900:4060::/44', '34.65.0.0/16', '34.104.110.0/23', '34.124.46.0/23', '35.216.128.0/17', '35.220.44.0/24', '35.235.216.0/21', '35.242.44.0/24', '2600:1900:4160::/44', '34.0.160.0/19', '34.154.0.0/16', '34.157.8.0/23', '34.157.121.0/24', '34.157.136.0/23', '34.157.249.0/24', '35.219.224.0/19', '2600:1901:8110::/44', '34.155.0.0/16', '34.157.12.0/22', '34.157.140.0/22', '34.163.0.0/16', '2600:1901:8120::/44', '34.36.0.0/16', '34.95.64.0/18', '34.96.64.0/18', '34.98.64.0/18', '34.102.128.0/17', '34.104.27.0/24', '34.107.128.0/17', '34.110.128.0/17', '34.111.0.0/16', '34.116.0.0/21', '34.117.0.0/16', '34.120.0.0/16', '34.128.128.0/18', '34.144.192.0/18', '34.149.0.0/16', '34.160.0.0/16', '35.186.192.0/18', '35.190.0.0/18', '35.190.64.0/19', '35.190.112.0/20', '35.201.64.0/18', '35.227.192.0/18', '35.241.0.0/18', '35.244.128.0/17', '107.178.240.0/20', '130.211.4.0/22', '130.211.8.0/21', '130.211.16.0/20', '130.211.32.0/20', '2600:1901::/48', '34.18.0.0/16', '34.157.126.0/23', '34.157.252.0/23', '2600:1901:81c0::/44', '34.0.64.0/19', '34.157.90.0/23', '34.157.216.0/23', '34.165.0.0/16', '2600:1901:8160::/44', '34.19.128.0/17', '34.20.0.0/17', '34.95.0.0/18', '34.104.76.0/22', '34.118.128.0/18', '34.124.12.0/22', '34.152.0.0/18', '35.203.0.0/17', '35.215.0.0/18', '35.220.43.0/24', '35.234.240.0/20', '35.242.43.0/24', '2600:1900:40e0::/44', '34.0.32.0/20', '34.104.114.0/23', '34.124.50.0/23', '34.124.112.0/20', '34.130.0.0/16', '34.152.69.0/24', '34.157.255.0/24', '2600:1900:41e0::/44', '34.95.128.0/17', '34.104.80.0/21', '34.124.16.0/21', '34.151.0.0/18', '34.151.192.0/18', '35.198.0.0/18', '35.199.64.0/18', '35.215.192.0/18', '35.220.40.0/24', '35.235.0.0/20', '35.242.40.0/24', '35.247.192.0/18', '2600:1900:40f0::/44', '34.0.48.0/20', '34.104.50.0/23', '34.127.178.0/23', '34.176.0.0/16', '2600:1901:4010::/44', '8.34.210.0/24', '8.34.212.0/22', '8.34.216.0/22', '8.35.192.0/21', '23.236.48.0/20', '23.251.144.0/20', '34.16.0.0/17', '34.27.0.0/16', '34.28.0.0/14', '34.33.0.0/16', '34.66.0.0/15', '34.68.0.0/14', '34.72.0.0/16', '34.118.200.0/21', '34.121.0.0/16', '34.122.0.0/15', '34.128.32.0/22', '34.132.0.0/14', '34.136.0.0/16', '34.157.84.0/23', '34.157.96.0/20', '34.157.212.0/23', '34.157.224.0/20', '34.170.0.0/15', '34.172.0.0/15', '34.177.52.0/22', '35.184.0.0/16', '35.188.0.0/17', '35.188.128.0/18', '35.188.192.0/19', '35.192.0.0/15', '35.194.0.0/18', '35.202.0.0/16', '35.206.64.0/18', '35.208.0.0/15', '35.220.64.0/19', '35.222.0.0/15', '35.224.0.0/15', '35.226.0.0/16', '35.232.0.0/16', '35.238.0.0/15', '35.242.96.0/19', '104.154.16.0/20', '104.154.32.0/19', '104.154.64.0/19', '104.154.96.0/20', '104.154.113.0/24', '104.154.114.0/23', '104.154.116.0/22', '104.154.120.0/23', '104.154.128.0/17', '104.155.128.0/18', '104.197.0.0/16', '104.198.16.0/20', '104.198.32.0/19', '104.198.64.0/20', '104.198.128.0/17', '107.178.208.0/20', '108.59.80.0/21', '130.211.112.0/20', '130.211.128.0/18', '130.211.192.0/19', '130.211.224.0/20', '146.148.32.0/19', '146.148.64.0/19', '146.148.96.0/20', '162.222.176.0/21', '173.255.112.0/21', '199.192.115.0/24', '199.223.232.0/22', '199.223.236.0/24', '2600:1900:4000::/44', '34.22.0.0/19', '35.186.0.0/17', '35.186.128.0/20', '35.206.32.0/19', '35.220.46.0/24', '35.242.46.0/24', '107.167.160.0/20', '108.59.88.0/21', '173.255.120.0/21', '2600:1900:4070::/44', '34.23.0.0/16', '34.24.0.0/15', '34.26.0.0/16', '34.73.0.0/16', '34.74.0.0/15', '34.98.128.0/21', '34.118.250.0/23', '34.138.0.0/15', '34.148.0.0/16', '34.152.72.0/21', '34.177.40.0/21', '35.185.0.0/17', '35.190.128.0/18', '35.196.0.0/16', '35.207.0.0/18', '35.211.0.0/16', '35.220.0.0/20', '35.227.0.0/17', '35.229.16.0/20', '35.229.32.0/19', '35.229.64.0/18', '35.231.0.0/16', '35.237.0.0/16', '35.242.0.0/20', '35.243.128.0/17', '104.196.0.0/18', '104.196.65.0/24', '104.196.66.0/23', '104.196.68.0/22', '104.196.96.0/19', '104.196.128.0/18', '104.196.192.0/19', '162.216.148.0/22', '2600:1900:4020::/44', '34.21.0.0/17', '34.85.128.0/17', '34.86.0.0/16', '34.104.60.0/23', '34.104.124.0/23', '34.118.252.0/23', '34.124.60.0/23', '34.127.188.0/23', '34.145.128.0/17', '34.150.128.0/17', '34.157.0.0/21', '34.157.16.0/20', '34.157.128.0/21', '34.157.144.0/20', '35.186.160.0/19', '35.188.224.0/19', '35.194.64.0/19', '35.199.0.0/18', '35.212.0.0/17', '35.220.60.0/22', '35.221.0.0/18', '35.230.160.0/19', '35.234.176.0/20', '35.236.192.0/18', '35.242.60.0/22', '35.243.40.0/21', '35.245.0.0/16', '2600:1900:4090::/44', '34.157.32.0/22', '34.157.160.0/22', '34.162.0.0/16', '2600:1901:8130::/44', '34.104.56.0/23', '34.127.184.0/23', '34.161.0.0/16', '35.206.10.0/23', '2600:1901:8150::/44', '34.0.128.0/19', '34.157.46.0/23', '34.157.174.0/23', '34.174.0.0/16', '2600:1901:8140::/44', '34.19.0.0/17', '34.82.0.0/15', '34.105.0.0/17', '34.118.192.0/21', '34.127.0.0/17', '34.145.0.0/17', '34.157.112.0/21', '34.157.240.0/21', '34.168.0.0/15', '35.185.192.0/18', '35.197.0.0/17', '35.199.144.0/20', '35.199.160.0/19', '35.203.128.0/18', '35.212.128.0/17', '35.220.48.0/21', '35.227.128.0/18', '35.230.0.0/17', '35.233.128.0/17', '35.242.48.0/21', '35.243.32.0/21', '35.247.0.0/17', '104.196.224.0/19', '104.198.0.0/20', '104.198.96.0/20', '104.199.112.0/20', '2600:1900:4040::/44', '34.20.128.0/17', '34.94.0.0/16', '34.102.0.0/17', '34.104.64.0/21', '34.108.0.0/16', '34.118.248.0/23', '34.124.0.0/21', '35.215.64.0/18', '35.220.47.0/24', '35.235.64.0/18', '35.236.0.0/17', '35.242.47.0/24', '35.243.0.0/21', '2600:1900:4120::/44', '34.22.32.0/19', '34.104.52.0/24', '34.106.0.0/16', '34.127.180.0/24', '35.217.64.0/18', '35.220.31.0/24', '35.242.31.0/24', '2600:1900:4170::/44', '34.16.128.0/17', '34.104.72.0/22', '34.118.240.0/22', '34.124.8.0/22', '34.125.0.0/16', '35.219.128.0/18', '2600:1900:4180::/44'];

app.set('trust proxy', trustedProxies.concat(['35.191.0.0/16', '130.211.0.0/22']));

app.get('/', (_, res) => {
  res.send('Welcome to Voltz API');
});

app.get('/ip', (req, res) => {
  res.send(req.ip);
});

// todo: to be deprecated when SDK stops consuming it
app.get('/chains/:chainId', (req, res) => {
  const process = async () => {
    const chainId = Number(req.params.chainId);

    const tradingVolume = await getChainTradingVolume([chainId]);

    const totalLiquidity = await getChainTotalLiquidity([chainId]);

    return {
      volume30Day: tradingVolume,
      totalLiquidity: totalLiquidity,
    };
  };

  process().then(
    (output) => {
      res.json(output);
    },
    (error) => {
      console.log(`API query failed with message ${(error as Error).message}`);
    },
  );
});

// todo: to be deprecated when SDK stops consuming it
app.get('/positions/:chainId/:vammAddress/:ownerAddress/:tickLower/:tickUpper', (req, res) => {
  console.log(`Requesting information about a position`);

  const process = async () => {
    const chainId = Number(req.params.chainId);
    const vammAddress = req.params.vammAddress;
    const ownerAddress = req.params.ownerAddress;
    const tickLower = Number(req.params.tickLower);
    const tickUpper = Number(req.params.tickUpper);

    const provider = getProvider(chainId);

    const existingPosition = await pullExistingPositionRow(
      chainId,
      vammAddress,
      ownerAddress,
      tickLower,
      tickUpper,
    );

    if (!existingPosition) {
      return {
        realizedPnLFromSwaps: 0,
        realizedPnLFromFeesPaid: 0,
        realizedPnLFromFeesCollected: 0,
        unrealizedPnLFromSwaps: 0,
      };
    }

    const amm = await getAmm(chainId, vammAddress);
    const maturityTimestamp = Math.floor(amm.termEndTimestampInMS / 1000);
    let currentTimestamp = (await provider.getBlock('latest')).timestamp;

    let currentLiquidityIndex = 1;

    if (maturityTimestamp >= currentTimestamp) {
      currentLiquidityIndex = await getLiquidityIndex(chainId, amm.marginEngine);
    } else {
      const blockAtSettlement = await getBlockAtTimestamp(provider, maturityTimestamp);

      currentLiquidityIndex = await getLiquidityIndex(chainId, amm.marginEngine, blockAtSettlement);

      currentTimestamp = maturityTimestamp;
    }

    // realized PnL
    const rPnL =
      existingPosition.cashflowLiFactor * currentLiquidityIndex +
      (existingPosition.cashflowTimeFactor * currentTimestamp) / SECONDS_IN_YEAR +
      existingPosition.cashflowFreeTerm;

    // unrealized PnL
    const currentTick = await getCurrentTick(chainId, vammAddress);
    const currentFixedRate = tickToFixedRate(currentTick);

    const timeInYears = getTimeInYearsBetweenTimestamps(currentTimestamp, maturityTimestamp);

    const uPnL =
      existingPosition.netNotionalLocked *
      (currentFixedRate - existingPosition.netFixedRateLocked) *
      timeInYears;

    return {
      realizedPnLFromSwaps: rPnL,
      realizedPnLFromFeesPaid: existingPosition.realizedPnLFromFeesPaid,
      realizedPnLFromFeesCollected: existingPosition.realizedPnLFromFeesCollected,
      unrealizedPnLFromSwaps: uPnL,
    };
  };

  process().then(
    (output) => {
      res.json(output);
    },
    (error) => {
      console.log(`API query failed with message ${(error as Error).message}`);
    },
  );
});

// todo: to be deprecated when SDK stops consuming it
app.get('/chain-pools/:chainId', (req, res) => {
  const process = async () => {
    const chainId = Number(req.params.chainId);

    const pools = await pullAllChainPools([chainId]);

    return pools;
  };

  process().then(
    (output) => {
      res.json(output);
    },
    (error) => {
      console.log(`API query failed with message ${(error as Error).message}`);
    },
  );
});

app.get('/pool/:chainId/:vammAddress', (req, res) => {
  const process = async () => {
    const chainId = Number(req.params.chainId);
    const vammAddress = req.params.vammAddress.toLowerCase();

    const pool = await pullExistingPoolRow(vammAddress, chainId);

    if (!pool) {
      throw new Error(`Pool ${vammAddress} does not exist on chain ${chainId}.`);
    }

    return pool;
  };

  process().then(
    (output) => {
      res.json(output);
    },
    (error) => {
      console.log(`API query failed with message ${(error as Error).message}`);
    },
  );
});

app.get('/chain-information/:chainIds', (req, res) => {
  const process = async () => {
    console.log('chainIds', req.params.chainIds);
    const chainIds = req.params.chainIds.split('&').map((s) => Number(s));

    const response = await Promise.allSettled([
      getChainTradingVolume(chainIds),
      getChainTotalLiquidity(chainIds),
    ]);

    if (response[0].status === 'rejected' || response[1].status === 'rejected') {
      throw new Error(`Couldn't fetch chain information.`);
    }

    return {
      volume30Day: response[0].value,
      totalLiquidity: response[1].value,
    };
  };

  process().then(
    (output) => {
      res.json(output);
    },
    (error) => {
      console.log(`API query failed with message ${(error as Error).message}`);
    },
  );
});

app.get('/all-pools/:chainIds', (req, res) => {
  const process = async () => {
    const chainIds = req.params.chainIds.split('&').map((s) => Number(s));

    const pools = await pullAllChainPools(chainIds);

    return pools;
  };

  process().then(
    (output) => {
      res.json(output);
    },
    (error) => {
      console.log(`API query failed with message ${(error as Error).message}`);
    },
  );
});

app.get('/position-pnl/:chainId/:vammAddress/:ownerAddress/:tickLower/:tickUpper', (req, res) => {
  console.log(`Requesting information about a position`);

  const process = async () => {
    const chainId = Number(req.params.chainId);
    const vammAddress = req.params.vammAddress;
    const ownerAddress = req.params.ownerAddress;
    const tickLower = Number(req.params.tickLower);
    const tickUpper = Number(req.params.tickUpper);

    const provider = getProvider(chainId);

    const existingPosition = await pullExistingPositionRow(
      chainId,
      vammAddress,
      ownerAddress,
      tickLower,
      tickUpper,
    );

    if (!existingPosition) {
      return {
        realizedPnLFromSwaps: 0,
        realizedPnLFromFeesPaid: 0,
        realizedPnLFromFeesCollected: 0,
        unrealizedPnLFromSwaps: 0,
      };
    }

    const amm = await getAmm(chainId, vammAddress);
    const maturityTimestamp = Math.floor(amm.termEndTimestampInMS / 1000);
    let currentTimestamp = (await provider.getBlock('latest')).timestamp;

    let currentLiquidityIndex = 1;

    if (maturityTimestamp >= currentTimestamp) {
      currentLiquidityIndex = await getLiquidityIndex(chainId, amm.marginEngine);
    } else {
      const blockAtSettlement = await getBlockAtTimestamp(provider, maturityTimestamp);

      currentLiquidityIndex = await getLiquidityIndex(chainId, amm.marginEngine, blockAtSettlement);

      currentTimestamp = maturityTimestamp;
    }

    // realized PnL
    const rPnL =
      existingPosition.cashflowLiFactor * currentLiquidityIndex +
      (existingPosition.cashflowTimeFactor * currentTimestamp) / SECONDS_IN_YEAR +
      existingPosition.cashflowFreeTerm;

    // unrealized PnL
    const currentTick = await getCurrentTick(chainId, vammAddress);
    const currentFixedRate = tickToFixedRate(currentTick);

    const timeInYears = getTimeInYearsBetweenTimestamps(currentTimestamp, maturityTimestamp);

    const uPnL =
      existingPosition.netNotionalLocked *
      (currentFixedRate - existingPosition.netFixedRateLocked) *
      timeInYears;

    return {
      realizedPnLFromSwaps: rPnL,
      realizedPnLFromFeesPaid: existingPosition.realizedPnLFromFeesPaid,
      realizedPnLFromFeesCollected: existingPosition.realizedPnLFromFeesCollected,
      unrealizedPnLFromSwaps: uPnL,
    };
  };

  process().then(
    (output) => {
      res.json(output);
    },
    (error) => {
      console.log(`API query failed with message ${(error as Error).message}`);
    },
  );
});

app.get('/fixed-rates/:chainId/:vammAddress/:startTimestamp/:endTimestamp', (req, res) => {
  console.log(`Requesting information about historical fixed rates`);

  const process = async () => {
    const chainId = Number(req.params.chainId);
    const vammAddress = req.params.vammAddress;
    const startTimestamp = Number(req.params.startTimestamp);
    const endTimestamp = Number(req.params.endTimestamp);

    const historicalRates = await getFixedRates(chainId, vammAddress, startTimestamp, endTimestamp);

    return historicalRates;
  };

  process().then(
    (output) => {
      res.json(output);
    },
    (error) => {
      console.log(`API query failed with message ${(error as Error).message}`);
    },
  );
});

app.get('/variable-rates/:chainId/:rateOracleAddress/:startTimestamp/:endTimestamp', (req, res) => {
  console.log(`Requesting information about historical variable rates`);

  const process = async () => {
    const chainId = Number(req.params.chainId);
    const rateOracleAddress = req.params.rateOracleAddress;
    const startTimestamp = Number(req.params.startTimestamp);
    const endTimestamp = Number(req.params.endTimestamp);

    const historicalRates = await getVariableRates(
      chainId,
      rateOracleAddress,
      startTimestamp,
      endTimestamp,
    );

    return historicalRates;
  };

  process().then(
    (output) => {
      res.json(output);
    },
    (error) => {
      console.log(`API query failed with message ${(error as Error).message}`);
    },
  );
});
