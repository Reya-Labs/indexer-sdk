export const getTimestampInSeconds = (): number => {
  return Math.floor(Date.now() / 1000);
};

export const getTimeInYearsBetweenTimestamps = (from: number, to: number): number => {
  if (from > to) {
    throw new Error(`Unordered timestamps ${from}-${to}`);
  }

  return (to - from) / 31_536_000;
};

export const sleep = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};
