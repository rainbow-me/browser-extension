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

  const onRef = (ref: HTMLIFrameElement) => {
    setRef(ref);
  };

  const container = ref?.contentDocument?.body;
  console.log('IFRAME container', container);

  return (
    <iframe
      style={{
        borderRadius: '26px',
        top: '88px',
        zIndex: '9999999',
        right: '100px',
        position: 'fixed',
        height: '40px',
        borderWidth: '0px',
      }}
      title="iframe"
      ref={onRef}
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
      borderColor="blue"
      style={{
        height: '40px',
      }}
    >
      <Rows space="6px">
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
