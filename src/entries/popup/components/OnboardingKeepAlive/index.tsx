import { useEffect, useRef } from 'react';

import { popupClient } from '../../handlers/background';
import { useAuth } from '../../hooks/useAuth';

export const OnboardingKeepAlive = () => {
  const { status } = useAuth();

  const timer = useRef<number>();

  useEffect(() => {
    if (status !== 'READY') {
      if (!timer.current) {
        timer.current = setInterval(async () => {
          await popupClient.health.ping();
        }, 1000);
      }
    } else {
      clearInterval(timer.current);
    }
  }, [status]);

  return null;
};
