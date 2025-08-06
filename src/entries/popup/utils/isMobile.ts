const userAgent = () =>
  typeof navigator !== 'undefined'
    ? navigator.userAgent.toLocaleLowerCase()
    : '';

const isAndroid = (ua = userAgent()) => ua.includes('android');

const isSmallIOS = (ua = userAgent()) =>
  ua.includes('iphone') || ua.includes('ipod');

const isLargeIOS = (ua = userAgent()) =>
  ua.includes('ipad') || (ua.includes('mac') && navigator.maxTouchPoints > 1);

const isIOS = (ua = userAgent()) => isSmallIOS(ua) || isLargeIOS(ua);

export function isMobile() {
  const ua = userAgent();
  if (!ua) return false;
  return isAndroid(ua) || isIOS(ua);
}
