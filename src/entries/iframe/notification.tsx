import React, { ReactNode, useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

import { Box, Row, Rows, Text } from '~/design-system';

export const Notification = () => {
  return (
    <IFrame>
      <NotificationComponent />
    </IFrame>
  );
};

function IFrame({ children }: { children: ReactNode }) {
  //   const ref = useRef<HTMLIFrameElement>(null);
  const [ref, setRef] = useState<HTMLIFrameElement>();

  const settttt = (ref: HTMLIFrameElement) => {
    console.log('SETTTINGGG REFFF', ref);
    setRef(ref);
  };

  const container = ref?.contentDocument?.body;
  console.log('IFRAME container', container);

  return (
    <iframe
      style={{
        width: '161px',
        height: '40px',
        borderRadius: '26px',
        borderWidth: '0px',
        backgroundColor: 'rgba(255, 255, 0, 0.8)',
        boxShadow:
          '0px 8px 24px rgba(37, 41, 46, 0.12), 0px 2px 6px rgba(0, 0, 0, 0.02);',

        top: '88px',
        zIndex: '9999999',
        right: '100px',
        position: 'absolute',
      }}
      title="iframe"
      ref={settttt}
    >
      {container && createPortal(children, container)}
    </iframe>
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
    <Box
      background="surfaceMenu"
      borderRadius="28px"
      backdropFilter="blur(26px)"
    >
      <Rows>
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
  );
};
