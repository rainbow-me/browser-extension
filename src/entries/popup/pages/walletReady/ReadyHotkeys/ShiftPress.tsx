import React from 'react';

import ShiftInactiveBottom from 'static/assets/onboarding/dark_shift_bottom@2x.png';
import ShiftPressedBottom from 'static/assets/onboarding/dark_shift_pressed_bottom@2x.png';
import ShiftPressed from 'static/assets/onboarding/dark_shift_pressed_top@2x.png';
import ShiftInactive from 'static/assets/onboarding/dark_shift_top@2x.png';
import ShiftInactiveBottomLight from 'static/assets/onboarding/light_shift_bottom@2x.png';
import ShiftPressedBottomLight from 'static/assets/onboarding/light_shift_pressed_bottom@2x.png';
import ShiftPressedLight from 'static/assets/onboarding/light_shift_pressed_top@2x.png';
import ShiftInactiveLight from 'static/assets/onboarding/light_shift_top@2x.png';
import { useCurrentThemeStore } from '~/core/state/currentSettings/currentTheme';
import { Box } from '~/design-system';

export function ShiftPress({ isShiftPressed }: { isShiftPressed: boolean }) {
  const { currentTheme } = useCurrentThemeStore();
  return (
    <Box paddingHorizontal="5px">
      <Box position="relative" style={{ width: '102px' }}>
        <>
          <Box
            as="img"
            position="absolute"
            src={currentTheme === 'dark' ? ShiftPressed : ShiftPressedLight}
            style={{
              width: '102px',
              zIndex: 1,
              top: isShiftPressed ? '2px' : 0,
              opacity: isShiftPressed ? 1 : 0,
              transition: 'opacity 0.2s ease-in-out, top 0.2s ease-in-out',
              transitionProperty: 'top',
              transitionDelay: '0.17s',
            }}
            alt="Shift"
          />
          <Box
            as="img"
            position="absolute"
            top="0"
            src={
              currentTheme === 'dark'
                ? ShiftPressedBottom
                : ShiftPressedBottomLight
            }
            style={{
              width: '102px',
              opacity: isShiftPressed ? 1 : 0,
              transition: 'opacity 0.2s ease-in-out',
            }}
            alt="Shift"
          />
        </>
        <>
          <Box
            as="img"
            position="absolute"
            top="0"
            src={currentTheme === 'dark' ? ShiftInactive : ShiftInactiveLight}
            style={{
              width: '102px',
              zIndex: 1,
              opacity: isShiftPressed ? 0 : 1,
              transition: 'opacity 0.2s ease-in-out',
            }}
            alt="Shift"
          />
          <Box
            as="img"
            position="absolute"
            top="0"
            src={
              currentTheme === 'dark'
                ? ShiftInactiveBottom
                : ShiftInactiveBottomLight
            }
            style={{
              width: '102px',
              opacity: isShiftPressed ? 0 : 1,
              transition: 'opacity 0.2s ease-in-out',
            }}
            alt="Shift"
          />
        </>
      </Box>
    </Box>
  );
}
