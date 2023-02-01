import React, { ReactNode, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

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

export const Notification = () => {
  return (
    <IFrame>
      <NotificationComponent />
    </IFrame>
  );
};

function IFrame({ children }: { children: ReactNode }) {
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
      root.style.background = 'transparent';
      root.style.height = '40px';
      root.style.width = '161px';
      root.style.position = 'fixed';
    }
    root?.setAttribute('class', 'lt');
    ref?.contentDocument?.head?.appendChild(iframeLink);
  }, [ref?.contentDocument]);

  return (
    <Box
      as={'iframe'}
      style={{
        top: '88px',
        zIndex: '9999999',
        right: '100px',
        position: 'fixed',
        height: '40px',
        width: '161px',
        borderWidth: '0px',
        background: 'transparent',
      }}
      title="iframe"
      className="ohihuhuihui"
      ref={onRef}
      allowTransparency={true}
    >
      {container && createPortal(children, container)}
    </Box>
  );
}

const NotificationComponent = () => {
  return (
    <ThemeProvider theme="light">
      <Box height="full" style={{ height: 40, width: 161 }}>
        <Inline height="full" alignVertical="center">
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
                      Network changed
                    </Text>
                  </Row>
                  <Row>
                    <Text color="labelTertiary" size="11pt" weight="medium">
                      Optimism
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
