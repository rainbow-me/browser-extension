import rInactiveBottom from 'static/assets/onboarding/dark_r_bottom@2x.png';
import rPressedBottom from 'static/assets/onboarding/dark_r_pressed_bottom@2x.png';
import rPressed from 'static/assets/onboarding/dark_r_pressed_top@2x.png';
import rInactive from 'static/assets/onboarding/dark_r_top@2x.png';
import rInactiveBottomLight from 'static/assets/onboarding/light_r_bottom@2x.png';
import rPressedBottomLight from 'static/assets/onboarding/light_r_pressed_bottom@2x.png';
import rPressedLight from 'static/assets/onboarding/light_r_pressed_top@2x.png';
import rInactiveLight from 'static/assets/onboarding/light_r_top@2x.png';
import { useCurrentThemeStore } from '~/core/state/currentSettings/currentTheme';
import { Box } from '~/design-system';

import { activeTransitions, inactiveTransitions } from './pressTransitions.css';

export function RPress({ isRPressed }: { isRPressed: boolean }) {
  const { currentTheme } = useCurrentThemeStore();
  return (
    <Box paddingHorizontal="5px">
      <Box position="relative" style={{ width: '44px' }}>
        <>
          <Box
            as="img"
            position="absolute"
            src={currentTheme === 'dark' ? rPressed : rPressedLight}
            style={{ width: '44px', zIndex: 1 }}
            className={
              activeTransitions[isRPressed ? 'pressed' : 'not pressed']
            }
            alt="R"
          />
          <Box
            as="img"
            position="absolute"
            top="0"
            src={currentTheme === 'dark' ? rPressedBottom : rPressedBottomLight}
            style={{
              width: '44px',
              opacity: isRPressed ? 1 : 0,
              transition: 'opacity 0.2s ease-in-out',
            }}
            alt="R"
          />
        </>

        <>
          <Box
            as="img"
            position="absolute"
            top="0"
            src={currentTheme === 'dark' ? rInactive : rInactiveLight}
            style={{ width: '44px', zIndex: 1 }}
            className={
              inactiveTransitions[isRPressed ? 'pressed' : 'not pressed']
            }
            alt="R"
          />
          <Box
            as="img"
            position="absolute"
            top="0"
            src={
              currentTheme === 'dark' ? rInactiveBottom : rInactiveBottomLight
            }
            style={{
              width: '44px',
              opacity: isRPressed ? 0 : 1,
              transition: 'opacity 0.2s ease-in-out',
            }}
            alt="R"
          />
        </>
      </Box>
    </Box>
  );
}
