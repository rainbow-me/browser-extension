import {
  NavigateOptions,
  To,
  useLocation,
  useNavigate,
} from 'react-router-dom';

export function useRainbowNavigate() {
  const location = useLocation();
  const navigate = useNavigate();

  return function (to: To, options?: NavigateOptions) {
    navigate(to, {
      ...(options || {}),
      state: { ...options?.state, from: location.pathname },
    });
  };
}
