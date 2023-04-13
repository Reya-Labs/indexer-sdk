import { SECONDS_IN_YEAR } from './constants';

export const getTimestampInSeconds = (): number => {
  return Math.floor(Date.now() / 1000);
};

export const getTimeInYearsBetweenTimestamps = (from: number, to: number): number => {
  if (from > to) {
    throw new Error(`Unordered timestamps ${from}-${to}`);
  }

  return (to - from) / SECONDS_IN_YEAR;
};

export const sleep = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};
