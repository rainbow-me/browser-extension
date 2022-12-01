import * as React from 'react';

import rainbowLogoLight from 'static/assets/rainbow/rainbow-logo-light.png';
import rainbowLogo from 'static/assets/rainbow/rainbow-logo.png';
import { i18n } from '~/core/languages';
import { Box, Button, Text, ThemeProvider } from '~/design-system';
import { Rows } from '~/design-system/components/Rows/Rows';
import { accentColorAsHsl } from '~/design-system/styles/core.css';
import { getTheme } from '~/design-system/styles/theme';

import { FlyingRainbows } from '../../components/FlyingRainbows';

export function Welcome() {
  const themeInfo = getTheme();

  return (
    <FlyingRainbows>
      <Box
        width="full"
        style={{ zIndex: 1, paddingTop: 127 }}
        background="transparent"
      >
        <Box
          width="full"
          display="flex"
          justifyContent="center"
          paddingBottom="4px"
        >
          <img
            src={
              (themeInfo.savedTheme || themeInfo.systemTheme) === 'light'
                ? rainbowLogoLight
                : rainbowLogo
            }
            width="162"
            height="40"
          />
        </Box>
        <Box
          width="full"
          justifyContent="center"
          alignItems="center"
          display="flex"
          style={{
            height: '21px',
          }}
        >
          <Text align="center" color="labelTertiary" size="16pt" weight="bold">
            {i18n.t('welcome.subtitle')}
          </Text>
        </Box>
        <Box width="full" style={{ marginTop: '226px' }}>
          <Rows alignVertical="top" space="20px">
            <Rows alignVertical="top" space="10px">
              <Button
                color="fill"
                height="44px"
                variant="flat"
                width="full"
                symbol="arrow.right"
                symbolSide="right"
                blur="26px"
              >
                {i18n.t('welcome.create_wallet')}
              </Button>
              <ThemeProvider theme="dark">
                <Button
                  color="surfacePrimaryElevated"
                  height="44px"
                  variant="raised"
                  width="full"
                >
                  {i18n.t('welcome.import_wallet')}
                </Button>
              </ThemeProvider>
            </Rows>
            <Box display="flex" style={{ width: '210px', margin: 'auto' }}>
              <Text
                align="center"
                color="labelTertiary"
                size="12pt"
                weight="regular"
                as="p"
              >
                {i18n.t('welcome.disclaimer_tos')}&nbsp;
                <a
                  href="https://rainbow.me/terms-of-use"
                  target="_blank"
                  style={{ color: accentColorAsHsl, cursor: 'pointer' }}
                  rel="noreferrer"
                >
                  {i18n.t('welcome.disclaimer_tos_link')}
                </a>
              </Text>
            </Box>
          </Rows>
        </Box>
      </Box>
    </FlyingRainbows>
  );
}
