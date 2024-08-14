import { useCallback, useEffect, useRef } from 'react';

import { initializeMessenger } from '~/core/messengers';

import { useAuth } from '../../hooks/useAuth';

export const OnboardingKeepAlive = () => {
  const bgMessenger = initializeMessenger({ connect: 'background' });

  const { status } = useAuth();

  const timer = useRef<undefined | Timer>(undefined);

  const keepAlive = useCallback(async () => {
    await bgMessenger.send('ping', {});
  }, [bgMessenger]);

  useEffect(() => {
    if (status !== 'READY') {
      if (!timer.current) {
        timer.current = setInterval(keepAlive, 1000);
      }
    } else {
      clearInterval(timer.current);
    }
  }, [keepAlive, status]);

  return null;
};
