export const space = {
  '2px': 2,
  '3px': 3,
  '4px': 4,
  '6px': 6,
  '8px': 8,
  '10px': 10,
  '12px': 12,
  '16px': 16,
  '20px': 20,
  '24px': 24,
  '28px': 28,
  '32px': 32,
  '36px': 36,
  '44px': 44,
  '52px': 52,
  '60px': 60,
  '72px': 72,
  '80px': 80,
  '104px': 104,
} as const;

export const negativeSpace = {
  '-2px': -2,
  '-3px': -3,
  '-4px': -4,
  '-6px': -6,
  '-8px': -8,
  '-10px': -10,
  '-12px': -12,
  '-16px': -16,
  '-20px': -20,
  '-24px': -24,
  '-28px': -28,
  '-32px': -32,
  '-36px': -36,
  '-44px': -44,
  '-52px': -52,
  '-60px': -60,
  '-72px': -72,
  '-80px': -80,
  '-104px': -104,
} as const;

const spaceToNegativeSpace: Record<
  keyof typeof space,
  keyof typeof negativeSpace
> = {
  '2px': '-2px',
  '3px': '-3px',
  '4px': '-4px',
  '6px': '-6px',
  '8px': '-8px',
  '10px': '-10px',
  '12px': '-12px',
  '16px': '-16px',
  '20px': '-20px',
  '24px': '-24px',
  '28px': '-28px',
  '32px': '-32px',
  '36px': '-36px',
  '44px': '-44px',
  '52px': '-52px',
  '60px': '-60px',
  '72px': '-72px',
  '80px': '-80px',
  '104px': '-104px',
};

export const positionSpace = {
  '0': 0,
} as const;

export type Space = keyof typeof space;
export type NegativeSpace = keyof typeof negativeSpace;
export type PositionSpace = keyof typeof positionSpace;

export function negateSpace(space: Space): NegativeSpace {
  return spaceToNegativeSpace[space];
}
