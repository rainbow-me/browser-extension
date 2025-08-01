import { useCallback } from 'react';
import {
  NavigateOptions,
  To,
  useLocation,
  useNavigate,
} from 'react-router-dom';

import { useTabNavigation } from '~/core/state/currentSettings/tabNavigation';

import { ROUTES } from '../urls';

export function useRainbowNavigate() {
  const location = useLocation();
  const navigate = useNavigate();
  const setSelectedTab = useTabNavigation((s) => s.setSelectedTab);

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
