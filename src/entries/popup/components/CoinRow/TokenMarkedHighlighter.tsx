import { useCurrentThemeStore } from '~/core/state/currentSettings/currentTheme';
import { Box } from '~/design-system';

import {
  higlighterBgDark,
  higlighterBgLight,
} from './TokenMarkedHighlighter.css';

export function TokenMarkedHighlighter() {
  const { currentTheme } = useCurrentThemeStore();

  return (
    <Box
      className={currentTheme === 'dark' ? higlighterBgDark : higlighterBgLight}
    />
  );
}
