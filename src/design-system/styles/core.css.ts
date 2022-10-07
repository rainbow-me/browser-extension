import { style } from '@vanilla-extract/css';
import { defineProperties, createSprinkles } from '@vanilla-extract/sprinkles';
import { space, negativeSpace, positionSpace } from './designTokens';

export const resetBase = style({
  margin: 0,
  padding: 0,
  border: 0,
  fontSize: '100%',
  font: 'inherit',
  verticalAlign: 'baseline',
});

const a = style({ textDecoration: 'none', color: 'inherit' });
const list = style({ listStyle: 'none' });
const table = style({ borderCollapse: 'collapse', borderSpacing: 0 });
const appearanceNone = style({ appearance: 'none' });
const backgroundTransparent = style({ backgroundColor: 'transparent' });
const field = [appearanceNone, backgroundTransparent];

const quotes = style({
  quotes: 'none',
  selectors: {
    '&:before, &:after': {
      content: ["''", 'none'],
    },
  },
});

const select = style([
  field,
  {
    ':disabled': {
      opacity: 1,
    },
    selectors: {
      '&::-ms-expand': {
        display: 'none',
      },
    },
  },
]);

const input = style([
  field,
  style({
    selectors: {
      '&::-ms-clear': {
        display: 'none',
      },
      '&::-webkit-search-cancel-button': {
        WebkitAppearance: 'none',
      },
    },
  }),
]);

export const resetElements = {
  a,
  blockquote: quotes,
  button: backgroundTransparent,
  input,
  ol: list,
  q: quotes,
  select,
  table,
  ul: list,
};

const boxProperties = defineProperties({
  properties: {
    alignItems: ['stretch', 'flex-start', 'center', 'flex-end'],
    bottom: positionSpace,
    display: ['none', 'flex', 'block', 'inline'],
    flexDirection: ['row', 'column'],
    gap: space,
    justifyContent: [
      'stretch',
      'flex-start',
      'center',
      'flex-end',
      'space-around',
      'space-between',
    ],
    left: positionSpace,
    marginBottom: negativeSpace,
    marginLeft: negativeSpace,
    marginRight: negativeSpace,
    marginTop: negativeSpace,
    paddingBottom: space,
    paddingLeft: space,
    paddingRight: space,
    paddingTop: space,
    position: ['relative', 'absolute', 'fixed'],
    right: positionSpace,
    top: positionSpace,
  },
  shorthands: {
    padding: ['paddingTop', 'paddingBottom', 'paddingLeft', 'paddingRight'],
    paddingX: ['paddingLeft', 'paddingRight'],
    paddingY: ['paddingTop', 'paddingBottom'],
    margin: ['marginTop', 'marginBottom', 'marginLeft', 'marginRight'],
    marginX: ['marginLeft', 'marginRight'],
    marginY: ['marginTop', 'marginBottom'],
    placeItems: ['justifyContent', 'alignItems'],
  },
});

export const boxStyles = createSprinkles(boxProperties);
export type BoxStyles = Parameters<typeof boxStyles>[0];
