import * as React from 'react';
import { useLocation } from 'react-router-dom';

import { useCurrentThemeStore } from '~/core/state/currentSettings/currentTheme';
import { useTestnetModeStore } from '~/core/state/currentSettings/testnetMode';
import { POPUP_DIMENSIONS } from '~/core/utils/dimensions';
import { Box } from '~/design-system';
import { zIndexes } from '~/entries/popup/utils/zIndexes';

import { useIsFullScreen } from '../../hooks/useIsFullScreen';
import { ROUTES } from '../../urls';

export const WindowStroke = () => {
  const { currentTheme } = useCurrentThemeStore();
  const isFullScreen = useIsFullScreen();
  const location = useLocation();
  const { testnetMode } = useTestnetModeStore();
  const displayingTestnetBar =
    testnetMode && location.pathname !== ROUTES.UNLOCK;

  const isDarkTheme = currentTheme === 'dark';
  const isLightFullScreen = currentTheme !== 'dark' && isFullScreen;

  const borderColor = React.useMemo(() => {
    if (displayingTestnetBar) {
      return '0, 87, 35'; // green90
    } else if (isDarkTheme) {
      return '245, 248, 255';
    } else if (isLightFullScreen) {
      return '9, 17, 31';
    } else {
      return '255, 255, 255';
    }
  }, [displayingTestnetBar, isDarkTheme, isLightFullScreen]);

  const boxShadow = React.useMemo(() => {
    const inset = isDarkTheme || !isFullScreen ? 'inset ' : '';
    const opacity =
      isFullScreen || location.pathname === ROUTES.UNLOCK ? 0.06 : 0.03;
    return `${inset}0 0 0 1px rgba(${borderColor}, ${
      displayingTestnetBar ? 1 : opacity
    })`;
  }, [
    borderColor,
    displayingTestnetBar,
    isDarkTheme,
    isFullScreen,
    location.pathname,
  ]);

  return (
    <Box
      borderRadius={isFullScreen ? '32px' : undefined}
      position="fixed"
      style={{
        bottom: isFullScreen ? '50%' : 0,
        boxShadow: boxShadow,
        height: isFullScreen ? POPUP_DIMENSIONS.height : '100%',
        left: 0,
        margin: '0 auto',
        pointerEvents: 'none',
        right: 0,
        top: isFullScreen ? '50%' : 0,
        transform: isFullScreen ? 'translateY(-50%)' : undefined,
        width: isFullScreen ? POPUP_DIMENSIONS.width : '100%',
        zIndex: isFullScreen
          ? zIndexes.FULL_SCREEN_WINDOW_STROKE
          : zIndexes.WINDOW_STROKE,
      }}
    />
  );
};
