import { useCallback } from 'react';
import {
  NavigateOptions,
  To,
  useLocation,
  useNavigate,
} from 'react-router-dom';

import { useSettingsStore } from '~/core/state/currentSettings/store';

import { ROUTES } from '../urls';

export function useRainbowNavigate() {
  const location = useLocation();
  const navigate = useNavigate();
  const [, setSelectedTab] = useSettingsStore('selectedTab');

  return useCallback(
    (to: To | number, options?: NavigateOptions) => {
      if (typeof to === 'number') {
        navigate(to);
        return;
      }

      if (to === ROUTES.HOME && options?.state?.tab) {
        setSelectedTab(options.state.tab);
      }

      navigate(to as To, {
        ...(options || {}),
        state: {
          ...options?.state,
          from: location.pathname,
        },
      });
    },
    [location.pathname, navigate, setSelectedTab],
  );
}
