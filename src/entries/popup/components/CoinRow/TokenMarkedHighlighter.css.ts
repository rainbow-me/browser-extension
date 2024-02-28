import { CSSProperties, style } from '@vanilla-extract/css';

const elementStyle: CSSProperties = {
  position: 'absolute',
  height: '60%',
  top: '50%',
  left: '8.3px',
  transform: 'translateY(-50%)',
  borderTopRightRadius: '3px',
  borderBottomRightRadius: '3px',
  width: '2px',
};

export const higlighterBgDark = style([
  {
    ...elementStyle,
    background: '#CE2233',
  },
]);

export const higlighterBgLight = style([
  { ...elementStyle, background: 'black' },
]);
