import React, { ReactNode, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

import { i18n } from '~/core/languages';
import { useCurrentThemeStore } from '~/core/state/currentSettings/currentTheme';
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

// 161 (figma width spec) + 48 (radius shadow) since we need space for the shadow to be visible in the iframe
const NOTIFICATION_WIDTH = '209px';
// 40 (figma height spec) + 48 (radius shadow) + 16 (vertical shadow), since we need space for the shadow to be visible in the iframe
const NOTIFICATION_HEIGHT = '122px';

// 9 (figma top spec) - 41 (extra iframe height for shadow, 122 - 40 /2 )
// since we need space for the shadow to be visible in the iframe
const NOTIFICATION_TOP = '-32px';
const NOTIFICATION_RIGHT = '100px';

export const Notification = () => {
  const { currentTheme } = useCurrentThemeStore();
  return (
    <IFrame theme={currentTheme}>
      <NotificationComponent theme={currentTheme} />
    </IFrame>
  );
};

function IFrame({
  children,
  theme,
}: {
  children: ReactNode;
  theme: 'dark' | 'light';
}) {
  const [ref, setRef] = useState<HTMLIFrameElement>();

  const onRef = (ref: HTMLIFrameElement) => {
    setRef(ref);
  };

  const container = ref?.contentDocument?.body;

  useEffect(() => {
    const iframeLink = document.createElement('link');
    iframeLink.href =
      'chrome-extension://gjmdpkmgceafaiefjdekbelbcjigmaed/popup.css';
    iframeLink.rel = 'stylesheet';
    const root = ref?.contentDocument?.getElementsByTagName('html')[0]; // '0' to assign the first (and only `HTML` tag)
    if (root) {
      root.style.background = 'none transparent !important';
      root.style.position = 'fixed';
      root.style.height = NOTIFICATION_HEIGHT;
      root.style.width = NOTIFICATION_WIDTH;
    }
    root?.setAttribute('class', theme === 'dark' ? 'dt' : 'lt');
    ref?.contentDocument?.head?.appendChild(iframeLink);
  }, [ref?.contentDocument, theme]);

  return (
    <iframe
      style={{
        top: NOTIFICATION_TOP,
        right: NOTIFICATION_RIGHT,
        height: NOTIFICATION_HEIGHT,
        width: NOTIFICATION_WIDTH,
        borderWidth: '0px',
        position: 'fixed',
        // background: 'none transparent !transparent',
        zIndex: '9999999',
      }}
      title="iframe"
      ref={onRef}
    >
      {container && createPortal(children, container)}
    </iframe>
  );
}

const NotificationComponent = ({ theme }: { theme: 'dark' | 'light' }) => {
  return (
    <ThemeProvider theme={theme}>
      <Box
        height="full"
        style={{ height: NOTIFICATION_HEIGHT, width: NOTIFICATION_WIDTH }}
      >
        <Inline height="full" alignVertical="center" alignHorizontal="center">
          <Box
            alignItems="center"
            borderRadius="28px"
            backdropFilter="blur(26px)"
            background="surfaceMenu"
            paddingLeft="8px"
            paddingRight="16px"
            paddingVertical="8px"
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
        </Inline>
      </Box>
    </ThemeProvider>
  );
};
