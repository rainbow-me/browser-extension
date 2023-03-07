const DECIMAL_POINT = '.';

export const maskInput = ({
  inputValue,
  decimals,
  integers,
}: {
  inputValue: string;
  decimals?: number;
  integers?: number;
}) => {
  if (inputValue === DECIMAL_POINT) return `0${DECIMAL_POINT}`;

  const partitions = inputValue
    .split(DECIMAL_POINT)
    .map((p) => p.replace(/[^0-9]/g, ''));

  const integerPart = partitions?.[0];
  const cleanIntegerPartSubstring = integers
    ? integerPart?.substring(0, integers)
    : integerPart;
  const cleanIntegerPart =
    cleanIntegerPartSubstring.length === 2
      ? String(Number(cleanIntegerPartSubstring))
      : cleanIntegerPartSubstring;

  const decimalsPart = partitions?.[1];
  const cleanDecimalsPart = decimalsPart?.substring(0, decimals ?? 18);

  const maskValue =
    decimalsPart !== undefined && decimals !== 0
      ? [cleanIntegerPart, cleanDecimalsPart].join(DECIMAL_POINT)
      : cleanIntegerPart;

  return maskValue;
};
