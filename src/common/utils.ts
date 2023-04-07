export const getTimestampInSeconds = (): number => {
  return Math.floor(Date.now() / 1000);
};

export const getTimeInYearsBetweenTimestamps = (from: number, to: number): number => {
  return (from - to) / 31_536_000;
};
