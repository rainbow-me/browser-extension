import React, { ReactNode, useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

import { Box, Inset, Row, Rows, Text, ThemeProvider } from '~/design-system';

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
        height: '100px',
        width: '400px',
        borderWidth: '0px',
      }}
      title="iframe"
      className="ohihuhuihui"
      ref={onRef}
    >
      {container && createPortal(children, container)}
    </Box>
  );
}

const NotificationComponent = () => {
  const [t, setT] = useState(0);

  const tick = useCallback(() => {
    console.log('tick');
    setT((t) => t + 1);
    setTimeout(() => tick(), 500);
  }, []);

  useEffect(() => tick(), [tick]);

  return (
    <ThemeProvider theme="light">
      <Box height="full" style={{ height: 60, width: 200 }}>
        <Inset horizontal="12px" vertical="12px">
          <Box
            borderRadius="28px"
            backdropFilter="blur(26px)"
            height="full"
            style={{
              boxShadow:
                '0px 8px 24px rgba(37, 41, 46, 0.12), 0px 2px 6px rgba(0, 0, 0, 0.02)',
            }}
          >
            <Rows alignVertical="center" space="6px">
              <Row>
                <Text color="label" size="16pt" weight="bold">
                  Network changed {t}
                </Text>
              </Row>
              <Row>
                <Text color="label" size="16pt" weight="bold">
                  Optimism
                </Text>
              </Row>
            </Rows>
          </Box>
        </Inset>
      </Box>
    </ThemeProvider>
  );
};
