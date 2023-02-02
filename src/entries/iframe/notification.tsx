import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

import { i18n } from '~/core/languages';
import { ChainId } from '~/core/types/chains';
import { chainNameFromChainId } from '~/core/utils/chains';
import {
  Box,
  Column,
  Columns,
  Inline,
  Row,
  Rows,
  Text,
  ThemeProvider,
} from '~/design-system';

const isDarkColor = (rgb: string) => {
  const from = rgb.indexOf('(');
  const to = rgb.indexOf(')');
  const [r, g, b] = rgb.substring(from + 1, to).split(',');
  return !(Number(r) > 40 || Number(g) > 40 || Number(b) > 40);
};

// 161 (figma width spec) + 48 (radius shadow) since we need space for the shadow to be visible in the iframe
const NOTIFICATION_WIDTH = '609px';
// const NOTIFICATION_WIDTH = '209px';
// 40 (figma height spec) + 48 (radius shadow) + 16 (vertical shadow), since we need space for the shadow to be visible in the iframe
const NOTIFICATION_HEIGHT = '552px';
// const NOTIFICATION_HEIGHT = '122px';

// 9 (figma top spec) - 41 (extra iframe height for shadow, 122 - 40 /2 )
// since we need space for the shadow to be visible in the iframe
const NOTIFICATION_TOP = '-32px';
const NOTIFICATION_RIGHT = '50px';

export const Notification = () => {
  const [ref, setRef] = useState<HTMLIFrameElement>();
  const [siteTheme, setSiteTheme] = useState<'dark' | 'light'>('dark');

  const onRef = (ref: HTMLIFrameElement) => {
    setRef(ref);
  };

  const container = ref?.contentDocument?.body;

  useEffect(() => {
    const iframeLink = document.createElement('link');
    iframeLink.href =
      'chrome-extension://gjmdpkmgceafaiefjdekbelbcjigmaed/popup.css';
    iframeLink.rel = 'stylesheet';

    const iframeMeta = document.createElement('meta');
    iframeMeta.name = 'color-scheme';

    // const isDarkMode =
    //   window.matchMedia && window.matchMedia('color-scheme: dark').matches;
    const colorScheme = (
      document.querySelector('meta[name="color-scheme"]') as HTMLMetaElement
    )?.content;
    const dataColorMode =
      window?.document.documentElement?.getAttribute('data-color-mode');
    const dataTheme =
      window?.document.documentElement?.getAttribute('data-theme');
    const dataMode =
      window?.document.documentElement?.getAttribute('data-mode');

    const style = window?.document.documentElement?.getAttribute('style');
    const dark = window?.document.documentElement?.getAttributeNode('dark');
    const backgroundColro = window
      .getComputedStyle(document.body, null)
      .getPropertyValue('background-color');

    console.log('- documentElement', document?.documentElement);
    console.log('- colorScheme', colorScheme);
    console.log('- dataColorMode', dataColorMode);
    console.log('- dataTheme', dataTheme);
    console.log('- dataMode', dataMode);
    console.log('- style', style);
    console.log('- dark', dark);
    console.log('- style?.includes', style?.includes('color-scheme: dark'));

    const extractedTheme =
      isDarkColor(backgroundColro) ||
      dataTheme === 'dark' ||
      style?.includes('color-scheme: dark') ||
      dataColorMode === 'dark' ||
      colorScheme === 'dark'
        ? 'dark'
        : 'light';

    console.log('--- extractedTheme', extractedTheme);
    const siteTheme =
      isDarkColor(backgroundColro) ||
      dataTheme === 'dark' ||
      style?.includes('color-scheme: dark') ||
      dataColorMode === 'dark' ||
      colorScheme === 'dark'
        ? 'dark'
        : 'light';

    const themeDefined = dataTheme || dataMode || dataColorMode || colorScheme;
    //   style?.includes('color-scheme: dark');

    console.log('THEME DEFINED ', themeDefined);
    setSiteTheme(siteTheme);
    iframeMeta.content = themeDefined;

    const root = ref?.contentDocument?.getElementsByTagName('html')[0];
    if (root) {
      root.style.background = 'none transparent !important';
      root.style.backgroundColor = 'none transparent !important';
      root.style.position = 'fixed';
      root.style.height = NOTIFICATION_HEIGHT;
      root.style.width = NOTIFICATION_WIDTH;
      root.style.cssText = 'background-color: transparent !important';
    }
    root?.setAttribute('class', colorScheme === 'dark' ? 'dt' : 'lt');
    ref?.contentDocument?.head?.appendChild(iframeLink);
    // ref?.contentDocument?.head?.appendChild(iframeMeta);
    themeDefined && ref?.contentDocument?.body?.appendChild(iframeMeta);
  }, [ref?.contentDocument]);

  console.log('SITE THEME', siteTheme);

  return (
    <iframe
      style={{
        top: NOTIFICATION_TOP,
        right: NOTIFICATION_RIGHT,
        height: NOTIFICATION_HEIGHT,
        width: NOTIFICATION_WIDTH,
        borderWidth: '0px',
        position: 'fixed',
        background: 'none transparent !transparent',
        zIndex: '9999999',
      }}
      title="iframe"
      ref={onRef}
    >
      {container &&
        createPortal(
          <NotificationComponent siteTheme={siteTheme} />,
          container,
        )}
    </iframe>
  );
};

const NotificationComponent = ({
  siteTheme,
}: {
  siteTheme: 'dark' | 'light';
}) => {
  return (
    <ThemeProvider theme={siteTheme}>
      <Box
        height="full"
        style={{
          height: NOTIFICATION_HEIGHT,
          width: NOTIFICATION_WIDTH,
        }}
      >
        <Inline height="full" alignVertical="center" alignHorizontal="center">
          <Box
            borderRadius="28px"
            style={
              {
                //   backgroundColor: siteTheme === 'dark' ? '#191A1C' : '#FFFFFF',
              }
            }
          >
            <Box
              borderRadius="28px"
              paddingLeft="8px"
              paddingRight="16px"
              paddingVertical="8px"
              alignItems="center"
              backdropFilter="blur(26px)"
              background="surfaceMenu"
              style={{
                boxShadow:
                  '0px 8px 24px rgba(37, 41, 46, 0.12), 0px 2px 6px rgba(0, 0, 0, 0.02)',
              }}
            >
              <Columns space="8px">
                <Column width="content">
                  <img
                    src="chrome-extension://gjmdpkmgceafaiefjdekbelbcjigmaed/assets/badges/arbitrumBadge.png"
                    width={24}
                    height={24}
                  />
                </Column>
                <Column>
                  <Rows alignVertical="center" space="6px">
                    <Row>
                      <Text color="label" size="12pt" weight="bold">
                        {i18n.t('injected_notifications.network_changed')}
                      </Text>
                    </Row>
                    <Row>
                      <Text color="labelTertiary" size="11pt" weight="medium">
                        {chainNameFromChainId(ChainId.optimism)}
                      </Text>
                    </Row>
                  </Rows>
                </Column>
              </Columns>
            </Box>
          </Box>
        </Inline>
      </Box>
    </ThemeProvider>
  );
};
