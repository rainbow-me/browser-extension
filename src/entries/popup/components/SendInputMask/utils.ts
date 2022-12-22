const DECIMAL_POINT = '.';

export const maskInput = ({
  inputValue,
  decimals,
}: {
  inputValue: string;
  decimals?: number;
}) => {
  if (inputValue === DECIMAL_POINT) return `0${DECIMAL_POINT}`;

  const partitions = inputValue
    .split(DECIMAL_POINT)
    .map((p) => p.replace(/[^0-9]/g, ''));

  const integerPart = partitions?.[0];
  const cleanIntegerPart =
    integerPart.length === 2 ? String(Number(integerPart)) : integerPart;

  const decimalsPart = partitions?.[1];
  const cleanDecimalsPart = decimalsPart?.substring(0, decimals ?? 18);

  const maskValue =
    decimalsPart !== undefined
      ? [cleanIntegerPart, cleanDecimalsPart].join(DECIMAL_POINT)
      : cleanIntegerPart;

  return maskValue;
};
