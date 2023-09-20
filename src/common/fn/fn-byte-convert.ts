export const fnByteToMb = (value?: number): number => {
  if (!value) return 0;
  return Math.floor(value / 10_000) / 100;
};

export const fnByteToGb = (value?: number): number => {
  if (!value) return 0;
  return Math.floor(value / 10_000_000) / 100;
};
