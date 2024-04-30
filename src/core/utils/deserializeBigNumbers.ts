import { BigNumber } from '@ethersproject/bignumber';

export function deserializeBigNumbers<T>(obj: T) {
  for (const key in obj) {
    const v = obj[key];
    if (!v || typeof v !== 'object') continue;

    if ('hex' in v && 'type' in v && v.type === 'BigNumber') {
      (obj[key] as BigNumber) = BigNumber.from(v.hex);
    } else {
      obj[key] = deserializeBigNumbers(v);
    }
  }

  return obj;
}
