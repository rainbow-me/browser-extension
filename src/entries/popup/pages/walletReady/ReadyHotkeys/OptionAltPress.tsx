import OptionInactiveBottomWindows from 'static/assets/onboarding/dark_alt_bottom@2x.png';
import OptionPressedBottomWindows from 'static/assets/onboarding/dark_alt_pressed_bottom@2x.png';
import OptionPressedWindows from 'static/assets/onboarding/dark_alt_pressed_top@2x.png';
import OptionInactiveWindows from 'static/assets/onboarding/dark_alt_top@2x.png';
import OptionInactiveBottomMacOS from 'static/assets/onboarding/dark_option_bottom@2x.png';
import OptionPressedBottomMacOS from 'static/assets/onboarding/dark_option_pressed_bottom@2x.png';
import OptionPressedMacOS from 'static/assets/onboarding/dark_option_pressed_top@2x.png';
import OptionInactiveMacOS from 'static/assets/onboarding/dark_option_top@2x.png';
import OptionInactiveBottomWindowsLight from 'static/assets/onboarding/light_alt_bottom@2x.png';
import OptionPressedBottomWindowsLight from 'static/assets/onboarding/light_alt_pressed_bottom@2x.png';
import OptionPressedWindowsLight from 'static/assets/onboarding/light_alt_pressed_top@2x.png';
import OptionInactiveWindowsLight from 'static/assets/onboarding/light_alt_top@2x.png';
import OptionInactiveBottomMacOSLight from 'static/assets/onboarding/light_option_bottom@2x.png';
import OptionPressedBottomMacOSLight from 'static/assets/onboarding/light_option_pressed_bottom@2x.png';
import OptionPressedMacOSLight from 'static/assets/onboarding/light_option_pressed_top@2x.png';
import OptionInactiveMacOSLight from 'static/assets/onboarding/light_option_top@2x.png';
import { useCurrentThemeStore } from '~/core/state/currentSettings/currentTheme';
import { Box } from '~/design-system';

import { activeTransitions, inactiveTransitions } from './pressTransitions.css';

const isWindows = navigator.userAgent.indexOf('Win') !== -1;
const OptionPressed = isWindows ? OptionPressedWindows : OptionPressedMacOS;

const OptionPressedBottom = isWindows
  ? OptionPressedBottomWindows
  : OptionPressedBottomMacOS;

const OptionInactive = isWindows ? OptionInactiveWindows : OptionInactiveMacOS;

const OptionInactiveBottom = isWindows
  ? OptionInactiveBottomWindows
  : OptionInactiveBottomMacOS;

const OptionPressedLight = isWindows
  ? OptionPressedWindowsLight
  : OptionPressedMacOSLight;

const OptionPressedBottomLight = isWindows
  ? OptionPressedBottomWindowsLight
  : OptionPressedBottomMacOSLight;

const OptionInactiveLight = isWindows
  ? OptionInactiveWindowsLight
  : OptionInactiveMacOSLight;

const OptionInactiveBottomLight = isWindows
  ? OptionInactiveBottomWindowsLight
  : OptionInactiveBottomMacOSLight;

export function OptionAltPress({
  isOptionPressed,
}: {
  isOptionPressed: boolean;
}) {
  const { currentTheme } = useCurrentThemeStore();
  return (
    <Box paddingHorizontal="5px">
      <Box position="relative" style={{ width: '44px' }}>
        <>
          <Box
            as="img"
            position="absolute"
            src={currentTheme === 'dark' ? OptionPressed : OptionPressedLight}
            style={{ width: '44px', zIndex: 1 }}
            className={
              activeTransitions[isOptionPressed ? 'pressed' : 'not pressed']
            }
            alt="Option"
          />
          <Box
            as="img"
            position="absolute"
            top="0"
            src={
              currentTheme === 'dark'
                ? OptionPressedBottom
                : OptionPressedBottomLight
            }
            style={{
              width: '44px',
              opacity: isOptionPressed ? 1 : 0,
              transition: 'opacity 0.2s ease-in-out',
            }}
            alt="Option"
          />
        </>

        <>
          <Box
            as="img"
            position="absolute"
            top="0"
            src={currentTheme === 'dark' ? OptionInactive : OptionInactiveLight}
            style={{ width: '44px', zIndex: 1 }}
            className={
              inactiveTransitions[isOptionPressed ? 'pressed' : 'not pressed']
            }
            alt="Option"
          />
          <Box
            as="img"
            position="absolute"
            top="0"
            src={
              currentTheme === 'dark'
                ? OptionInactiveBottom
                : OptionInactiveBottomLight
            }
            style={{
              width: '44px',
              opacity: isOptionPressed ? 0 : 1,
              transition: 'opacity 0.2s ease-in-out',
            }}
            alt="Option"
          />
        </>
      </Box>
    </Box>
  );
}
