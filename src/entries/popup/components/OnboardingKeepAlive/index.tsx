import { useCallback, useEffect, useRef } from 'react';

import { initializeMessenger } from '~/core/messengers';

import { useAuth } from '../../hooks/useAuth';

export const OnboardingKeepAlive = () => {
  const bgMessenger = initializeMessenger({ connect: 'background' });

  const { status } = useAuth();

  const timer = useRef<undefined | NodeJS.Timer>(undefined);

  const keepAlive = useCallback(async () => {
    console.log('sending ping...');
    const response: { payload: string } = await bgMessenger.send('ping', {});
    console.log('response?', response);
    if (response.payload === 'pong') {
      console.log('pong received');
    }
  }, [bgMessenger]);

  useEffect(() => {
    if (status !== 'READY') {
      timer.current = setInterval(keepAlive, 1000);
    } else {
      clearInterval(timer.current);
    }
  }, [keepAlive, status]);

  return null;
};
