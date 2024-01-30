export const mapToRange = (
  num: number,
  inputRange: [number, number],
  outputRange: [number, number],
) => {
  const [inMin, inMax] = inputRange;
  const [outMin, outMax] = outputRange;
  const result = ((num - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
  return result > outMax ? outMax : result;
};
