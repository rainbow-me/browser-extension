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

const isMac = navigator.userAgent.indexOf('Mac') !== -1;
const OptionPressed = isMac ? OptionPressedMacOS : OptionPressedWindows;

const OptionPressedBottom = isMac
  ? OptionPressedBottomMacOS
  : OptionPressedBottomWindows;

const OptionInactive = isMac ? OptionInactiveMacOS : OptionInactiveWindows;

const OptionInactiveBottom = isMac
  ? OptionInactiveBottomMacOS
  : OptionInactiveBottomWindows;

const OptionPressedLight = isMac
  ? OptionPressedMacOSLight
  : OptionPressedWindowsLight;

const OptionPressedBottomLight = isMac
  ? OptionPressedBottomMacOSLight
  : OptionPressedBottomWindowsLight;

const OptionInactiveLight = isMac
  ? OptionInactiveMacOSLight
  : OptionInactiveWindowsLight;

const OptionInactiveBottomLight = isMac
  ? OptionInactiveBottomMacOSLight
  : OptionInactiveBottomWindowsLight;

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
