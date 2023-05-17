import { POPUP_DIMENSIONS } from '~/core/utils/dimensions';

export const isExternalPopup = window.location.href.includes('tabId=');
export const isFullScreen =
  window.innerHeight > POPUP_DIMENSIONS.height &&
  window.innerWidth > POPUP_DIMENSIONS.width;
