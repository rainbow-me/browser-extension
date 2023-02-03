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
const NOTIFICATION_WIDTH = '209px';
// 40 (figma height spec) + 48 (radius shadow) + 16 (vertical shadow), since we need space for the shadow to be visible in the iframe
const NOTIFICATION_HEIGHT = '122px';

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
    const documentElement = window?.document.documentElement;

    const colorScheme = (
      document.querySelector('meta[name="color-scheme"]') as HTMLMetaElement
    )?.content;
    const dataColorMode = documentElement?.getAttribute('data-color-mode');
    const dataTheme = documentElement?.getAttribute('data-theme');
    const dataMode = documentElement?.getAttribute('data-mode');

    const style = documentElement?.getAttribute('style');
    const classs = documentElement?.getAttributeNode('class');
    const backgroundColro = window
      .getComputedStyle(document.body, null)
      .getPropertyValue('background-color');

    const colorSchemeIndex =
      documentElement?.innerHTML?.indexOf('color-scheme');

    // could be a meta tag, part of script, a class or style
    // so we need to check if any theme is defined
    const allPossibleSchemes = documentElement?.innerHTML.substring(
      colorSchemeIndex - 30,
      colorSchemeIndex + 60,
    );

    const cleanAllPossibleSchemes = allPossibleSchemes?.replace(
      'prefers-color-scheme',
      '',
    );
    const htmlIncludesColorScheme =
      cleanAllPossibleSchemes?.includes('color-scheme');

    let innerHTMLColorScheme = undefined;
    if (htmlIncludesColorScheme) {
      if (cleanAllPossibleSchemes.includes('light dark')) {
        innerHTMLColorScheme = 'light dark';
      } else if (cleanAllPossibleSchemes.includes('dark light')) {
        innerHTMLColorScheme = 'dark light';
      } else if (cleanAllPossibleSchemes.includes('dark')) {
        innerHTMLColorScheme = 'dark';
      } else if (cleanAllPossibleSchemes.includes('light')) {
        innerHTMLColorScheme = 'light';
      }
    }

    const siteTheme =
      isDarkColor(backgroundColro) ||
      dataTheme === 'dark' ||
      style?.includes('color-scheme: ') ||
      dataColorMode === 'dark' ||
      colorScheme === 'dark'
        ? 'dark'
        : 'light';

    const styleColorScheme = style?.includes('color-scheme: ')
      ? style?.replace('color-scheme: ', '').replace(';', '')
      : undefined;

    let classStyle = undefined;
    if (classs?.value?.includes('dark')) {
      classStyle = 'dark';
    } else if (classs?.value?.includes('light')) {
      classStyle = 'light';
    }

    const themeDefined =
      innerHTMLColorScheme ||
      dataMode ||
      dataColorMode ||
      colorScheme ||
      styleColorScheme ||
      classStyle;
    setSiteTheme(siteTheme);

    if (themeDefined || htmlIncludesColorScheme) {
      // we need to inject a meta tag with color-scheme if the site defined it
      // so the iframe background is transparent, otherwise it will be black or white
      // depending on the theme
      const iframeMeta = document.createElement('meta');
      iframeMeta.name = 'color-scheme';
      iframeMeta.content = themeDefined || '';
      ref?.contentDocument?.body?.appendChild(iframeMeta);
    }

    // inject popup.css to use rnbw DS
    const iframeLink = document.createElement('link');
    iframeLink.href =
      'chrome-extension://gjmdpkmgceafaiefjdekbelbcjigmaed/popup.css';
    iframeLink.rel = 'stylesheet';
    ref?.contentDocument?.head?.appendChild(iframeLink);

    const root = ref?.contentDocument?.getElementsByTagName('html')[0];
    // get the iframe element
    if (root) {
      // set background-color as cssText
      // background and backgroundColor as <iframe /> prop doesn't work
      root.style.cssText = 'background-color: transparent !important';
      // set rnbw theme
      root.setAttribute('class', colorScheme === 'dark' ? 'dt' : 'lt');
    }
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
