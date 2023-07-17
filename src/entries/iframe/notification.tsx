import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

import { i18n } from '~/core/languages';
import { ChainId, ChainNameDisplay } from '~/core/types/chains';
import { isDarkColor } from '~/core/utils/colors';
import { INJECTED_NOTIFICATION_DIMENSIONS } from '~/core/utils/dimensions';
import {
  Box,
  Column,
  Columns,
  Inline,
  Row,
  Rows,
  Symbol,
  Text,
  ThemeProvider,
} from '~/design-system';

const ASSET_SOURCE = {
  [ChainId.mainnet]: 'assets/badges/ethereumBadge.png',
  [ChainId.optimism]: 'assets/badges/optimismBadge.png',
  [ChainId.arbitrum]: 'assets/badges/arbitrumBadge.png',
  [ChainId.polygon]: 'assets/badges/polygonBadge.png',
  [ChainId.base]: 'assets/badges/baseBadge.png',
  [ChainId.zora]: 'assets/badges/zoraBadge.png',
  [ChainId.bsc]: 'assets/badges/bscBadge.png',
};

export const Notification = ({
  chainId,
  status,
  extensionUrl,
}: {
  chainId: ChainId;
  status: 'success' | 'failed';
  extensionUrl: string;
}) => {
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
    const htmlStyle = documentElement?.getAttribute('style');
    const htmlClass = documentElement?.getAttributeNode('class')?.value;
    const backgroundColor = window
      .getComputedStyle(document.body, null)
      .getPropertyValue('background-color');

    // use rainbowkit to determine the theme, if present
    const siteUsingRainbowkit =
      documentElement?.innerHTML?.includes('[data-rk]');

    const rainbowKitConnectButtonColorIndex =
      documentElement?.innerHTML?.indexOf(
        '--rk-colors-connectButtonBackground',
      );

    const rainbowKitConnectButtonColor = documentElement?.innerHTML.substring(
      rainbowKitConnectButtonColorIndex + 36,
      rainbowKitConnectButtonColorIndex + 40,
    );

    const rainbowKitLightMode = rainbowKitConnectButtonColor === '#FFF';

    let rainbowKitTheme: 'light' | 'dark' | undefined = undefined;
    if (siteUsingRainbowkit) {
      rainbowKitTheme = rainbowKitLightMode ? 'light' : 'dark';
    }

    const siteTheme =
      rainbowKitTheme ||
      (isDarkColor(backgroundColor) ||
      dataTheme === 'dark' ||
      dataColorMode === 'dark' ||
      colorScheme === 'dark'
        ? 'dark'
        : 'light');

    setSiteTheme(siteTheme);

    const colorSchemeIndex =
      documentElement?.innerHTML?.indexOf('color-scheme');

    // could be a meta tag, part of script, a class or style
    // so we need to check if any theme is defined
    const allPossibleSchemes = documentElement?.innerHTML.substring(
      colorSchemeIndex - 30,
      colorSchemeIndex + 60,
    );

    // prefers-color-scheme is just the OS config so we don't want to
    // take that value
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

    // check if style has a color-scheme
    const styleColorScheme = htmlStyle?.includes('color-scheme: ')
      ? htmlStyle?.replace('color-scheme: ', '').replace(';', '')
      : undefined;

    // check is the html has a theme class
    let htmlClassStyle = undefined;
    if (htmlClass?.includes('dark')) {
      htmlClassStyle = 'dark';
    } else if (htmlClass?.includes('light')) {
      htmlClassStyle = 'light';
    }

    const metaTagColorScheme =
      innerHTMLColorScheme ||
      dataMode ||
      dataColorMode ||
      colorScheme ||
      styleColorScheme ||
      htmlClassStyle;

    // we need to inject a meta tag with color-scheme if the site defined it
    // so the iframe background is transparent, otherwise it will be black or white
    // depending on the theme
    if (metaTagColorScheme) {
      const iframeMeta = document.createElement('meta');
      iframeMeta.name = 'color-scheme';
      iframeMeta.content = metaTagColorScheme;
      ref?.contentDocument?.body?.appendChild(iframeMeta);
    }

    // inject popup.css to use rnbw DS
    const iframeLink = document.createElement('link');
    iframeLink.href = `${extensionUrl}popup.css`;
    iframeLink.rel = 'stylesheet';
    ref?.contentDocument?.head?.appendChild(iframeLink);

    // get the iframe element
    const root = ref?.contentDocument?.getElementsByTagName('html')[0];
    if (root) {
      // set background-color as cssText
      // background and backgroundColor as <iframe /> prop doesn't work
      root.style.cssText = 'background-color: transparent !important';
      // set rnbw theme
      root.setAttribute('class', colorScheme === 'dark' ? 'dt' : 'lt');
    }
  }, [extensionUrl, ref?.contentDocument]);

  return (
    <iframe
      style={{
        top: INJECTED_NOTIFICATION_DIMENSIONS.top,
        right: INJECTED_NOTIFICATION_DIMENSIONS.right,
        height: INJECTED_NOTIFICATION_DIMENSIONS.height,
        width: INJECTED_NOTIFICATION_DIMENSIONS.width,
        borderWidth: '0px',
        position: 'fixed',
        zIndex: '9999999',
      }}
      title="iframe"
      ref={onRef}
    >
      {container &&
        createPortal(
          <NotificationComponent
            siteTheme={siteTheme}
            chainId={chainId}
            status={status}
            extensionUrl={extensionUrl}
          />,
          container,
        )}
    </iframe>
  );
};

const NotificationComponent = ({
  chainId,
  siteTheme,
  status,
  extensionUrl,
}: {
  chainId: ChainId;
  siteTheme: 'dark' | 'light';
  status: 'success' | 'failed';
  extensionUrl: string;
}) => {
  return (
    <ThemeProvider theme={siteTheme}>
      <Box
        height="full"
        position="fixed"
        style={{
          height: INJECTED_NOTIFICATION_DIMENSIONS.height,
          width: INJECTED_NOTIFICATION_DIMENSIONS.width,
        }}
      >
        <Inline height="full" alignVertical="center" alignHorizontal="center">
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
                {status === 'success' ? (
                  <img
                    src={`${extensionUrl}${ASSET_SOURCE[chainId]}`}
                    width={24}
                    height={24}
                  />
                ) : (
                  <Box
                    height="full"
                    borderRadius="round"
                    background="red"
                    style={{ width: 24, height: 24 }}
                  >
                    <Inline
                      height="full"
                      alignVertical="center"
                      alignHorizontal="center"
                    >
                      <Box marginTop="-1px">
                        <Symbol
                          symbol="exclamationmark.triangle.fill"
                          weight="bold"
                          size={14}
                        />
                      </Box>
                    </Inline>
                  </Box>
                )}
              </Column>
              <Column>
                <Rows alignVertical="center" space="6px">
                  <Row>
                    <Text color="label" size="12pt" weight="bold">
                      {i18n.t(
                        `injected_notifications.${
                          status === 'success'
                            ? 'network_changed'
                            : 'network_changed_failed'
                        }`,
                      )}
                    </Text>
                  </Row>
                  <Row>
                    <Text color="labelTertiary" size="11pt" weight="medium">
                      {status === 'success'
                        ? ChainNameDisplay[chainId]
                        : i18n.t('injected_notifications.unsupported_network')}
                    </Text>
                  </Row>
                </Rows>
              </Column>
            </Columns>
          </Box>
        </Inline>
      </Box>
    </ThemeProvider>
  );
};
