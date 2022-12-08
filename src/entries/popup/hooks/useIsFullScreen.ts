import { POPUP_DIMENSIONS } from '~/core/utils/dimensions';

export function useIsFullScreen() {
  return (
    window.innerHeight > POPUP_DIMENSIONS.height &&
    window.innerWidth > POPUP_DIMENSIONS.width
  );
}
