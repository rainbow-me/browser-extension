import {
  NavigateOptions,
  To,
  useLocation,
  useNavigate,
} from 'react-router-dom';

export function useRainbowNavigate() {
  const location = useLocation();
  const navigate = useNavigate();

  return function (to: To | number, options?: NavigateOptions) {
    if (typeof to === 'number') {
      navigate(to);
      return;
    }

    navigate(to as To, {
      ...(options || {}),
      state: {
        ...options?.state,
        from: location.pathname,
      },
    });
  };
}
