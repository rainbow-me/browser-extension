import {
  type Dinero,
  type DineroCurrency,
  dinero,
  toDecimal,
  toSnapshot,
} from 'dinero.js/bigint';

// ---------------------------------------------------------------------------
// Currency factory
// ---------------------------------------------------------------------------

export const makeCurrency = (
  code: string,
  decimals: number,
): DineroCurrency<bigint> => ({
  code,
  base: 10n,
  exponent: BigInt(decimals),
});

// ---------------------------------------------------------------------------
// Dinero <-> decimal-string conversion
// ---------------------------------------------------------------------------

export const fromDecimalString = (
  value: string,
  decimals: number,
  code = '',
): Dinero<bigint> => {
  const currency = makeCurrency(code, decimals);
  const neg = value.startsWith('-');
  const abs = neg ? value.slice(1) : value;
  const [int = '0', frac = ''] = abs.split('.');
  const padded = frac.padEnd(decimals, '0').slice(0, decimals);
  const raw = BigInt(int + padded);
  return dinero({ amount: neg ? -raw : raw, currency });
};

export const toDecimalString = (d: Dinero<bigint>): string => toDecimal(d);

// ---------------------------------------------------------------------------
// Dinero divide helpers (dinero.js v2 has no divide, only allocate)
// ---------------------------------------------------------------------------

/**
 * Divide two Dinero objects, returning a dimensionless ratio as a decimal
 * string. Used for exchange rates, price impact, percentages.
 */
export const ratioDinero = (a: Dinero<bigint>, b: Dinero<bigint>): string => {
  const snapA = toSnapshot(a);
  const snapB = toSnapshot(b);
  if (snapB.amount === 0n) return '0';

  const scaleA = BigInt(snapA.scale);
  const scaleB = BigInt(snapB.scale);
  let amountA = snapA.amount;
  let amountB = snapB.amount;
  if (scaleA < scaleB) {
    amountA *= 10n ** (scaleB - scaleA);
  } else if (scaleB < scaleA) {
    amountB *= 10n ** (scaleA - scaleB);
  }

  return fixedToDec((amountA * SCALE) / amountB);
};

/**
 * Divide a Dinero object by a decimal-string scalar, returning a new Dinero
 * in the same currency. Used for fiat->token conversion.
 */
export const divideByScalar = (
  d: Dinero<bigint>,
  scalar: string,
): Dinero<bigint> => {
  const snap = toSnapshot(d);
  const scalarFixed = decToFixed(scalar);
  if (scalarFixed === 0n) return d;

  const scale = BigInt(snap.scale);
  const result = (snap.amount * SCALE) / scalarFixed;
  const factor = 10n ** (BigInt(PRECISION) - scale);
  const finalAmount = result / factor;
  return dinero({ amount: finalAmount, currency: snap.currency });
};

// ---------------------------------------------------------------------------
// Fixed-point bigint primitives (20-decimal precision)
// ---------------------------------------------------------------------------

export const PRECISION = 20;
const SCALE = 10n ** BigInt(PRECISION);

export const decToFixed = (v: string): bigint => {
  if (
    !v ||
    v === 'NaN' ||
    v === 'Infinity' ||
    v === '-Infinity' ||
    v === 'undefined' ||
    v === 'null'
  )
    return 0n;

  let s = v;
  if (s.includes('e') || s.includes('E')) {
    const num = Number(s);
    if (!Number.isFinite(num)) return 0n;
    s = num.toFixed(PRECISION);
  }

  const neg = s.startsWith('-');
  const abs = neg ? s.slice(1) : s;
  const cleaned = abs.replace(/[^0-9.]/g, '');
  const [int = '0', frac = ''] = cleaned.split('.');
  if (!int && !frac) return 0n;
  const raw = BigInt(
    (int || '0') + frac.padEnd(PRECISION, '0').slice(0, PRECISION),
  );
  return neg ? -raw : raw;
};

export const fixedToDec = (v: bigint): string => {
  const neg = v < 0n;
  const abs = (neg ? -v : v).toString().padStart(PRECISION + 1, '0');
  const int = abs.slice(0, -PRECISION) || '0';
  const frac = abs.slice(-PRECISION).replace(/0+$/, '');
  return (neg ? '-' : '') + (frac ? `${int}.${frac}` : int);
};

export { SCALE };

export type { Dinero, DineroCurrency };
