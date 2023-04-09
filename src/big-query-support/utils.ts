import { BigQueryInt, BigQueryTimestamp } from '@google-cloud/bigquery';

export const bqNumericToNumber = (bqNumeric: BigQueryInt): number => {
  return Number(bqNumeric.toString());
};

export const bqTimestampToUnixSeconds = (bqTimestamp: BigQueryTimestamp): number => {
  return Math.floor(new Date(bqTimestamp.value).getTime() / 1000);
};
