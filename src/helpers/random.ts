export const getRandomIntInclusive = (min: number, max: number) => {
  const minCeiled = Math.ceil(min);
  const maxFloored = Math.floor(max);
  return Math.floor(Math.random() * (maxFloored - minCeiled + 1) + minCeiled);
}

export const getRandomIntPositive = () => {
  return getRandomIntInclusive(1, Number.MAX_SAFE_INTEGER);
};
