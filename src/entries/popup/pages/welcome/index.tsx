import * as React from 'react';

import rainbowLight from 'static/assets/rainbow/light-rainbow.png';
import rainbowNeon from 'static/assets/rainbow/neon-rainbow.png';
import rainbowOg from 'static/assets/rainbow/og-rainbow.png';
import rainbowPixel from 'static/assets/rainbow/pixel-rainbow.png';
import rainbowLogo from 'static/assets/rainbow/rainbow-logo.png';
import rainbowWhite from 'static/assets/rainbow/white-rainbow.png';
import { i18n } from '~/core/languages';
import { Box, Button, Text } from '~/design-system';
import { Rows } from '~/design-system/components/Rows/Rows';
import { accentColorAsHsl } from '~/design-system/styles/core.css';

export function Welcome() {
  return (
    <Box
      display="flex"
      width="full"
      alignItems="center"
      justifyContent="center"
      flexDirection="column"
      height="full"
      background="transparent"
    >
      <Box
        background="surfacePrimaryElevated"
        display="flex"
        flexDirection="column"
        alignItems="center"
        borderRadius="32px"
        padding="24px"
        style={{
          width: 360,
          height: 600,
          paddingTop: 151,
          border: '1px solid white',
          alignSelf: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Box
          style={{
            background: 'transparent',
            position: 'absolute',
            top: '0px',
            left: '0px',
            right: '0px',
            bottom: '0px',
          }}
        >
          <img
            src={rainbowPixel}
            width="155"
            height="155"
            style={{
              position: 'absolute',
              right: '0px',
              top: '-10px',
            }}
          />
          <img
            src={rainbowWhite}
            width="171"
            style={{
              position: 'absolute',
              left: '0px',
              top: '0px',
            }}
          />
          <img
            src={rainbowOg}
            height="130"
            style={{
              position: 'absolute',
              left: '0px',
              top: '360px',
            }}
          />
          <img
            src={rainbowLight}
            width="170"
            style={{
              position: 'absolute',
              left: '100px',
              top: '370px',
            }}
          />
          <img
            src={rainbowNeon}
            width="155"
            style={{
              position: 'absolute',
              right: '0px',
              bottom: '0px',
            }}
          />
        </Box>
        <Box style={{ zIndex: 1 }} background="transparent">
          <Box width="full" style={{ textAlign: 'center' }} paddingBottom="8px">
            <img src={rainbowLogo} width="162" height="40" />
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
            <Text
              align="center"
              color="labelTertiary"
              size="16pt"
              weight="bold"
            >
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
                  symbol="arrow.left"
                  symbolSide="right"
                >
                  {i18n.t('welcome.create_wallet')}
                </Button>
                <Button
                  color="surfaceSecondaryElevated"
                  height="44px"
                  variant="raised"
                  width="full"
                >
                  {i18n.t('welcome.import_wallet')}
                </Button>
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
      </Box>
    </Box>
  );
}
